module.exports = {
    WELCOME: "Did you know that as time passes your voting power on the EOS platform decays and " +
        "that you should update it once in a while?\n\nI'm here to help you keep track of your votes, " +
        "all you need to do is register your EOS account and I'll let you know when it is time to confirm them.",
    START: "Please, send me a message with your EOS account so we can proceed.",
    MORE_INFORMATION: "If you need more information type /help.",
    SELECT_ACTIONS: "Ok, what do you want to do with this account?\n\n Select one of the options below to continue.",
    SELECT_THRESHOLD: "Please, select the decay threshold for the voting power of your account.",
    REMOVE_CONFIRMATION: "Are you sure you want to remove this account? You wont't receive alerts for it anymore.",
    SEND_ALERT: "Done! I'll send you an alert when it is time to confirm your votes.",
    WARNING_TIME: "It should happen on ",
    ACCOUNT_REMOVED: "Your account was removed!",
    ACCOUNT_NOT_FOUND: "Account not found! Have you registered it already?",
    ALREADY_REGISTERED: "Nothing changed! This account is already registered with the same decay threshold selected.",
    ACCOUNT_NOT_REMOVED: "Great, your account was not removed!",
    INVALID_ACCOUNT: "This is not a valid account. A valid EOS account has 12 characters, with letters from a to z " +
        "and numbers from 1 to 5. Please, try again.",
    ACCOUNT_REGISTERED_ALERT: "\u2705 Account Registered!",
    ACCOUNT_UPDATED_ALERT: "\u2705 Account Updated!",
    ALREADY_REGISTERED_ALERT: "\u274C Account already registered!",
    ACCOUNT_REMOVED_ALERT: "\u2705 Account removed!",
    ACCOUNT_NOT_FOUND_ALERT: "\u274C Account not found!",
    WARNING_MESSAGE: "Hey there! It is time to confirm your votes!",
    VOTE_UPDATED: "Voting power updated, I will notify you when your voting power has decayed by ",
    HELP: "I'm here to help you keep track of your votes on the EOS platform. Send me a message with your EOS " +
        "account and you'll be able to do the following actions:\n\n" +
        "*Register Account*\n\n" +
        "    This option allows you to register an account so you can receive an alert from me when your voting " +
        "power has decayed the specified amount.\n\n" +
        "    Note that you can register as many accounts as you want.\n\n" +
        "*Update Threshold*\n\n" +
        "    This option allows you to update the decay threshold you specified during the registration of " +
        "an account. The decay threshold represents the amount of voting power you accept to lose.\n\n." +
        "*Set Alert Frequency*\n\n" +
        "    This option allows you to set the frequency in which you want to receive alerts from me. By default " +
        "you will receive an alert only once." +
        "*Remove Account*\n\n" +
        "    This options allows you to remove an account you have previously registered. Once you remove it, you " +
        "won't receive any more alerts for this account."
};
