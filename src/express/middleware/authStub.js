// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var authModule = require('../../auth');

///.auth/login/facebook?session_mode=token&completion_type=postMessage&completion_origin=http%3A%2F%2Flocalhost%3A3001
module.exports = function (configuration) {
    if(configuration && configuration.auth && Object.keys(configuration.auth).length > 0) {
        var auth = authModule(configuration.auth);

        return function (req, res, next) {
            if (req.params.provider === 'done') {
                res.status(200).end();
            } else {
                var payload = {
                        "sub": "sid:00000000000000000000000000000000",
                        "idp": req.params.provider,
                        "ver": "3",
                        "iss": "urn:microsoft:windows-azure:zumo",
                        "aud": "urn:microsoft:windows-azure:zumo",
                        "exp": jwtDate(expiry()),
                        "nbf": jwtDate(new Date())
                    },
                    token = auth.sign(payload),
                    envelope = {
                        type: "LoginCompleted",
                        oauth: {
                            authenticationToken: token,
                            user: { userId: payload.sub }
                        }
                    };
                //res.send('<html><body>Hello!</body></html>');
                //res.redirect('/.auth/login/done#token=' + encodeURIComponent(JSON.stringify(envelope.oauth)));
                res.send("<script>window.onload = function () { if (window.opener) window.opener.postMessage('" + JSON.stringify(envelope) + "', '*'); window.location.href = '/.auth/login/done#token=" + encodeURIComponent(JSON.stringify(envelope.oauth)) + "' }</script>");
            }

            function expiry() {
                // expire local tokens after a day
                var date = new Date();
                date.setDate(date.getDate() + 1);
                return date;
            }

            function jwtDate(date) {
                return Math.round(date.getTime() / 1000);
            }
        };
    } else {
        return function (req, res, next) {
            next();
        };
    }
};