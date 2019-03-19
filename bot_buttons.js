const init_buttons = (account) => {
    return [
        [
            {
                text: "Register Account",
                callback_data: JSON.stringify({
                    cmd: "register",
                    act: account
                })
            },
            {
                text: "Update Decay Threshold",
                callback_data: JSON.stringify({
                    cmd: "update",
                    act: account
                })
            },
        ],
        [
            {
                text: "Set Alert Frequency",
                callback_data: JSON.stringify({
                    cmd: "alert",
                    act: account
                })
            },
            {
                text: "Remove Account",
                callback_data: JSON.stringify({
                    cmd: "remove",
                    act: account
                })
            }
        ]
    ];
};

const threshold_buttons = (account) => {
    return [
        [
            {
                text: "1%",
                callback_data: JSON.stringify({
                    cmd: "threshold",
                    act: account,
                    val: 1
                })
            },
            {
                text: "2.5%",
                callback_data: JSON.stringify({
                    cmd: "threshold",
                    act: account,
                    val: 2.5
                })
            },
            {
                text: "5%",
                callback_data: JSON.stringify({
                    cmd: "threshold",
                    act: account,
                    val: 5
                })
            },
            {
                text: "10%",
                callback_data: JSON.stringify({
                    cmd: "threshold",
                    act: account,
                    val: 10
                })
            },
            {
                text: "15%",
                callback_data: JSON.stringify({
                    cmd: "threshold",
                    act: account,
                    val: 15
                })
            },
            {
                text: ">= 20%",
                callback_data: JSON.stringify({
                    cmd: "threshold",
                    act: account,
                    val: 20
                })
            }
        ]
    ];
};

const frequency_buttons = (account) => {
    return [
        [
            {
                text: "Once",
                callback_data: JSON.stringify({
                    cmd: "frequency",
                    act: account,
                    val: 0
                })
            },
            {
                text: "Twice a Day",
                callback_data: JSON.stringify({
                    cmd: "frequency",
                    act: account,
                    val: 0.5
                })
            }
        ],
        [
            {
                text: "Once a Day",
                callback_data: JSON.stringify({
                    cmd: "frequency",
                    act: account,
                    val: 1
                })
            },
            {
                text: "Twice a Week",
                callback_data: JSON.stringify({
                    cmd: "frequency",
                    act: account,
                    val: 4.5
                })
            },
            {
                text: "Once a Week",
                callback_data: JSON.stringify({
                    cmd: "frequency",
                    act: account,
                    val: 7
                })
            }
        ]
    ];
};

const question_buttons = (account) => {
    return [
        [
            {
                text: "Yes",
                callback_data: JSON.stringify({
                    cmd: "confirmation",
                    act: account,
                    val: true
                })
            },
            {
                text: "No",
                callback_data: JSON.stringify({
                    cmd: "confirmation",
                    act: account,
                    val: false
                })
            }
        ]
    ];
};

module.exports = {
    init_buttons,
    threshold_buttons,
    frequency_buttons,
    question_buttons
};
