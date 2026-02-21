export const forgot_pass_html = (name , link )=>{
       return {
        subject : "Forgot password ",
        html : `
         <h1>You forgot your password ${name} <h1/>
         <h2> Follow this link to reset your password ${link}<h2> 
         <h2> and make sure to write it somewhere this time <h2> 
        `
       }
}