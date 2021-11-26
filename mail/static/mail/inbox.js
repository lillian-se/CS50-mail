document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document.querySelector("#compose-form").onsubmit = submit_email;

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}
function submit_email() {
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      load_mailbox("sent");
    });
  return false;
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#item-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>
  <div class = 'titles'>
  <p>Sender</p>
  <p>Recipients</p>
  <p>Subject</p>
  <p>Timestamp</p>
</div>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...

      emails.forEach((element) => {
        let item = document.createElement("div");
        console.log(element.read);
        if (element.read) {
          item.classList.add("read");
        }
        item.innerHTML = `<p>${element["sender"]}</p>
        <p>${element["recipients"]}</p>
        <p>${element["subject"]}</p>
        <p>${element["timestamp"]}</p>
      `;
        item.addEventListener("click", function () {
          load_email(element);
        });
        document.querySelector("#emails-view").appendChild(item);
        item.classList.add("email-item");
      });
    });
}

function load_email(email) {
  document.querySelector("#item-view").style.display = "block";
  document.querySelector("#emails-view").style.display = "none";
  const username = document.querySelector("#username").innerHTML;
  console.log(username);
  fetch(`/emails/${email["id"]}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
  document.querySelector("#item-view").innerHTML = `
  <span>From: </span><p>${email["sender"]}</p>
  
  <span>To: </span><p>${email["recipients"]}</p>
  <span>Subject: </span><p>${email["subject"]}</p>
  <span>Timestamp: </span><p>${email["timestamp"]}</p><br>
  <button class="btn btn-md btn-outline-primary" id="reply">Reply</button>
  <hr>
  <span>Content: </span><p>${email["body"]}</p>
`;
  if (email.sender != username) {
    document.querySelector("#item-view").innerHTML += `
  
  
  <button class="btn btn-md btn-outline-primary" id="archive">${
    email["archived"] ? "Unarchive" : "Archive"
  }</button>
  `;

    document.querySelector("#archive").addEventListener("click", () => {
      fetch(`/emails/${email["id"]}`, {
        method: "PUT",
        body: JSON.stringify({
          archived: !email.archived,
        }),
      });

      load_mailbox("inbox");
    });
  }
  document.querySelector("#reply").addEventListener("click", () => {
    document.querySelector("#compose-recipients").value = `${email["sender"]}`;
    document.querySelector(
      "#compose-subject"
    ).value = `Re: ${email["subject"]}`;
    document.querySelector(
      "#compose-body"
    ).value = `On ${email["timestamp"]} ${email["sender"]} wrote:
${email["body"]}`;
    reply();
  });
}
function reply() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#item-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
}
