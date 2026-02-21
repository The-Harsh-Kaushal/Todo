export const welcome_email_html = (name)=>{
    return { subject : "Welcome to Taskify 🎉",
         html: `
        <h2>Hello ${name},</h2>
        <p>Your account was successfully created.</p>
        <p>We're happy to have you onboard.</p>
      `}
}
