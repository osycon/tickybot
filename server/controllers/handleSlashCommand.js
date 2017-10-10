const responses = require('../utils/responses');
const { userCommands, adminCommands } = require('../utils/constants');
const { sendMessage, getUserInfo } = require('../handlers/responseHandlers');

module.exports = async (req, res) => {
  res.status(200).end();
  const {
    user_id, team_id, user_name, text, response_url,
  } = req.body;
  // TODO determine user status (https://api.slack.com/methods/users.info)
  const userInfo = await getUserInfo(user_id);
  // const isAdmin = userInfo.is_admin
  const isAdmin = false;

  // Example of how to use firebase handlers
  // const userResult = await firebaseHandler.addUser(user_id, user_name);
  // const ticketResult = await firebaseHandler.addNewTicket(user_id, text);
  // const tickets = await firebaseHandler.getAllTickets();

  /*
  Content from users comes in as req.
  If no input other than /ticket given, assign HELLO action
  which returns default response with usage instructions and ticket status ???
  Otherwise tokenize input, parse input into command and a message
  and determine the appropriate action to take.
  If command not recognized treat entire input as a ticket message for users,
  but return ERROR to admins.
  */

  let command = '';
  let message = '';
  let response = {};

  if (!text) {
    response = await responses.HELLO({ isAdmin });
  } else {
    const tokenized = req.body.text.match(/\S+/g);
    command = tokenized[0].toUpperCase();

    if (isAdmin) {
      // TODO SOLVE command requires ticketId
      response = adminCommands.includes(command)
        ? responses[command]({ isAdmin })
        : responses.ERROR({ isAdmin });
    } else if (userCommands.includes(command)) {
      // TODO CLOSE, UNSOLVE commands require ticketId
      message = tokenized.splice(1).join(' ');
      response = await responses[command]({ user_id, message });
    } else {
      message = tokenized.join(' ');
      response = await responses.OPEN({ user_id, message });
    }
  }

  console.log({
    isAdmin,
    message,
    response,
    request: req.body,
  });

  sendMessage(response_url, response);
};
