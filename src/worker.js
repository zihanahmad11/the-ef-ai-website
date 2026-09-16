const JSON_HEADERS={"content-type":"application/json;charset=UTF-8","cache-control":"no-store","x-content-type-options":"nosniff"};
const AUTOMATION_NEEDS=new Set(["AI inbound receptionist","Outbound speed-to-lead","Lead qualification","Appointment booking","WhatsApp or Messenger agent","Warm handoffs","Surveys and feedback","CRM integration","Multiple automations","Not sure yet"]);
const VOLUMES=new Set(["Fewer than 50","50–100","101–250","251–500","501–1,000","More than 1,000","Not sure"]);

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==="/api/strategy-audit"){
      if(request.method==="OPTIONS")return new Response(null,{status:204,headers:JSON_HEADERS});
      if(request.method!=="POST")return json({message:"Method not allowed."},405);
      return submitAudit(request,env,ctx);
    }
    const response=await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    headers.set("X-Content-Type-Options","nosniff");headers.set("Referrer-Policy","strict-origin-when-cross-origin");headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");headers.set("X-Frame-Options","SAMEORIGIN");
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  },
  async scheduled(_event,env,ctx){ctx.waitUntil(retryFailedNotifications(env))}
};

async function submitAudit(request,env,ctx){
  const origin=request.headers.get("Origin")||"";
  const allowed=(env.ALLOWED_ORIGINS||"https://theefai.com,https://www.theefai.com").split(",").map(x=>x.trim());
  if(origin&&!allowed.includes(origin))return json({message:"This form cannot be submitted from that origin."},403);
  const length=Number(request.headers.get("Content-Length")||0);
  if(length>15000)return json({message:"The submission is too large."},413);
  let body;try{body=await request.json()}catch{return json({message:"Invalid form submission."},400)}
  if(JSON.stringify(body).length>15000)return json({message:"The submission is too large."},413);
  if(clean(body.website,200))return json({ok:true,reference:"AUD-RECEIVED"});
  const validation=validate(body);if(validation)return json({message:validation},400);
  const ip=request.headers.get("CF-Connecting-IP")||"unknown";
  const ipHash=await sha256(`${env.IP_HASH_SALT}:${ip}`);
  const recent=await env.LEADS.prepare("SELECT COUNT(*) AS total FROM leads WHERE ip_hash = ? AND created_at > datetime('now','-1 hour')").bind(ipHash).first();
  if((recent?.total||0)>=5)return json({message:"Too many recent requests. Please wait and try again."},429);
  const turnstile=await verifyTurnstile(body["cf-turnstile-response"],ip,env.TURNSTILE_SECRET);
  const allowedHosts=(env.TURNSTILE_HOSTNAMES||"theefai.com,www.theefai.com").split(",").map(x=>x.trim());
  if(!turnstile.success||turnstile.action!=="strategy_audit"||(turnstile.hostname&&!allowedHosts.includes(turnstile.hostname)))return json({message:"Verification failed. Please refresh the page and try again."},400);
  const now=new Date(),reference=`AUD-${now.toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,6).toUpperCase()}`,id=crypto.randomUUID();
  const lead={id,reference,createdAt:now.toISOString(),fullName:clean(body.fullName,100),workEmail:clean(body.workEmail,254).toLowerCase(),phone:clean(body.phone,40),businessName:clean(body.businessName,120),automationNeed:clean(body.automationNeed,80),monthlyVolume:clean(body.monthlyVolume,40),projectDetails:clean(body.projectDetails,2000),sourcePage:clean(body.sourcePage,500),utmSource:clean(body.utm_source,100),utmMedium:clean(body.utm_medium,100),utmCampaign:clean(body.utm_campaign,100)};
  await env.LEADS.prepare("INSERT INTO leads (id,reference,created_at,full_name,work_email,phone,business_name,automation_need,monthly_volume,project_details,consent_at,source_page,utm_source,utm_medium,utm_campaign,ip_hash,status,internal_email_status,customer_email_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(lead.id,lead.reference,lead.createdAt,lead.fullName,lead.workEmail,lead.phone,lead.businessName,lead.automationNeed,lead.monthlyVolume,lead.projectDetails,lead.createdAt,lead.sourcePage,lead.utmSource,lead.utmMedium,lead.utmCampaign,ipHash,"new","pending","pending").run();
  ctx.waitUntil(deliverNotifications(lead,env));
  return json({ok:true,reference},201);
}

function validate(body){
  const required=[["fullName",100],["workEmail",254],["businessName",120],["projectDetails",2000]];
  for(const [key,max] of required){const value=clean(body[key],max+1);if(!value)return "Please complete all required fields.";if(value.length>max)return "One or more fields are too long."}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(clean(body.workEmail,254)))return "Enter a valid email address.";
  if(clean(body.phone,100).length>40)return "The phone number is too long.";
  if(!AUTOMATION_NEEDS.has(body.automationNeed)||!VOLUMES.has(body.monthlyVolume))return "Select a valid dropdown option.";
  if(body.consent!==true&&body.consent!=="true"&&body.consent!=="on")return "Consent is required to process your enquiry.";
  if(!clean(body["cf-turnstile-response"],2048))return "Please complete the verification.";
  return null;
}

async function verifyTurnstile(token,ip,secret){
  try{const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secret,response:token,remoteip:ip,idempotency_key:crypto.randomUUID()})});return await response.json()}catch{return {success:false}}
}

async function deliverNotifications(lead,env,current={internal:"pending",customer:"pending"}){
  const safe=Object.fromEntries(Object.entries(lead).map(([k,v])=>[k,escapeHtml(v)]));
  if(current.internal!=="sent"){
    let status="failed";try{await env.NOTIFY_LEADS.send({to:"theefai.agent@gmail.com",from:{email:"forms@theefai.com",name:"The EF Ai"},replyTo:lead.workEmail,subject:`New AI Strategy Audit — ${lead.businessName} — ${lead.reference}`,html:`<h2>New AI Strategy Audit</h2><p><b>Reference:</b> ${safe.reference}</p><p><b>Name:</b> ${safe.fullName}<br><b>Work email:</b> ${safe.workEmail}<br><b>Phone/WhatsApp:</b> ${safe.phone||"Not supplied"}<br><b>Business:</b> ${safe.businessName}<br><b>Primary need:</b> ${safe.automationNeed}<br><b>Monthly enquiries:</b> ${safe.monthlyVolume}</p><p><b>What they want to automate</b></p><p>${safe.projectDetails.replaceAll("\n","<br>")}</p>`,text:`New AI Strategy Audit\nReference: ${lead.reference}\nName: ${lead.fullName}\nEmail: ${lead.workEmail}\nPhone/WhatsApp: ${lead.phone||"Not supplied"}\nBusiness: ${lead.businessName}\nPrimary need: ${lead.automationNeed}\nMonthly enquiries: ${lead.monthlyVolume}\n\n${lead.projectDetails}`});status="sent"}catch(error){console.error("Internal notification failed",lead.reference,error)}await env.LEADS.prepare("UPDATE leads SET internal_email_status=? WHERE id=?").bind(status,lead.id).run();
  }
  if(current.customer!=="sent"){
    let status="failed";try{const response=await fetch(env.APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify({...lead,sharedSecret:env.APPS_SCRIPT_SHARED_SECRET})});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.message||"Apps Script rejected request");status="sent"}catch(error){console.error("Customer confirmation failed",lead.reference,error)}await env.LEADS.prepare("UPDATE leads SET customer_email_status=? WHERE id=?").bind(status,lead.id).run();
  }
}

async function retryFailedNotifications(env){
  const {results=[]}=await env.LEADS.prepare("SELECT * FROM leads WHERE internal_email_status='failed' OR customer_email_status='failed' ORDER BY created_at ASC LIMIT 20").all();
  for(const row of results){const lead={id:row.id,reference:row.reference,createdAt:row.created_at,fullName:row.full_name,workEmail:row.work_email,phone:row.phone,businessName:row.business_name,automationNeed:row.automation_need,monthlyVolume:row.monthly_volume,projectDetails:row.project_details,sourcePage:row.source_page,utmSource:row.utm_source,utmMedium:row.utm_medium,utmCampaign:row.utm_campaign};await deliverNotifications(lead,env,{internal:row.internal_email_status,customer:row.customer_email_status})}
}

function clean(value,max){return String(value??"").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"").slice(0,max)}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
async function sha256(value){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,"0")).join("")}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:JSON_HEADERS})}
