export const task_status_change_html = (name, taskTitle, status) => {
  return {
    subject: "Task Status Updated",
    html: `
      <h1>${name}  change the task status<h1/>
      <h2>Your task "${taskTitle}" status has been changed to: ${status} <h2> 

    `
  }
}
export const task_assignment_html = (name, taskTitle) => {
  return {
    subject: "New Task Assigned",
    html: `
      <h1>Hello ${name} <h1/>
      <h2>You have been assigned a new task: "${taskTitle}" <h2> 
    `
  }
}