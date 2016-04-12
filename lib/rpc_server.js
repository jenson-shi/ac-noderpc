/**
 * Copyright (c) 2015-2016 上海魔霸网络技术, Inc. All Rights Reserved.
 *
 * AC-NodeRPC
 *
 *  shixiongfei@7fgame.com
 *
 */

var _Transport = require('./transport');

/**
 * @class
 */
function ServerRPC() {
    this.identifier = Math.round(Math.random() * 1000000);
    this.client_list = {};

    var _this = this;

    this._callback = function(trans, req) {
        if ( req ) {
            switch ( req.message_type ) {
                case trans._protocol._proto.MessageType.REQUEST_LOGIN:
                {
                    var login_req = trans._protocol._proto.LoginRequest.decode(req.message_body);

                    var login_ret = (_this.auth && login_req.auth == _this.auth) ? true : false;

                    trans.session_id = _this._generatorSessionID();

                    _this.client_list[trans.session_id] = {
                        seession_id: trans.session_id,
                        keepalive: new Date().getTime() + (login_ret ? 5000 : 100),
                        connection: trans
                    };

                    var login_resp = trans._protocol._proto.LoginResponse.encode({
                        result: (login_ret ? trans._protocol._proto.LoginResultType.LOGIN_SUCCESS : trans._protocol._proto.LoginResultType.LOGIN_AUTH_FAILED),
                        session_id: trans.session_id
                    });
                    trans.write(trans._protocol._proto.MessageType.RESPONSE_LOGIN, login_resp);

                    break;
                }
                case trans._protocol._proto.MessageType.REQUEST_KEEPALIVE:
                {
                    break;
                }
                case trans._protocol._proto.MessageType.REQUEST_CALL:
                {
                    var call_req = trans._protocol._proto.CallRequest.decode(req.message_body);

                    break;
                }
            }
        }
    };

    this._generatorSessionID = function() {
        this.identifier += 1;
        return new Date().getTime().toString(16) + this.identifier.toString(16);
    };

    this.run = function(opt) {
        if ( opt.auth ) {
            this.auth = opt.auth;
        }

        this._transport = new _Transport(this._callback);

        if ( opt.type.toLowerCase() == "tcp" ) {
            this._transport.listenTCP(opt.port);
        }
    };
}

module.exports = ServerRPC;