'use strict';

const line = require('@line/bot-sdk');
const request = require('request-promise');

const config = {
    channelSecret: process.env.channelSecretLINE,
    channelAccessToken: process.env.channelAccessTokenLINE
};

const client = new line.Client(config);
const API_TOKEN = process.env.API_TOKEN;
const API_ENDPOINT = process.env.API_ENDPOINT;
    
exports.handler = async (event) => {
    
    console.log(event);
    
    const replyToken = JSON.parse(event.body).events[0].replyToken;
    
    let reqMessage = JSON.parse(event.body).events[0].message.text;
    let resMessage = "";
    let options = {};

    if (reqMessage == 'ビットコイン') {
        options.url = 'https://api.coin.z.com/public/v1/ticker?symbol=BTC';

        await request(options).then(function (body) {
            const coinData = JSON.parse(body).data[0];
            resMessage = `現在のレートです\n` +
            `買値: ${coinData.ask}\n` +
            `売値: ${coinData.bid}\n` +
            `高値: ${coinData.high}\n` +
            `最終取引価格: ${coinData.last}\n` +
            `低値: ${coinData.low}\n` +
            `取引量: ${coinData.volume}`;
        }).catch(function (err) {
            console.log(err);
            resMessage = 'データの取得に失敗しました';
        });

        return client.replyMessage(
            replyToken, 
            {
                'type': 'text',
                'text': resMessage
            }
        );

    } else if (reqMessage == 'リップル') {
        options.url = 'https://api.coin.z.com/public/v1/ticker?symbol=XRP';

        await request(options).then(function (body) {
            const coinData = JSON.parse(body).data[0];
            resMessage = `現在のレートです\n` +
            `買値: ${coinData.ask}\n` +
            `売値: ${coinData.bid}\n` +
            `高値: ${coinData.high}\n` +
            `最終取引価格: ${coinData.last}\n` +
            `低値: ${coinData.low}\n` +
            `取引量: ${coinData.volume}`;
        }).catch(function (err) {
            console.log(err);
            resMessage = 'データの取得に失敗しました';
        });

        return client.replyMessage(
            replyToken, 
            {
                'type': 'text',
                'text': resMessage
            }
        );


    } else if (reqMessage === 'ありがとう') {
        resMessage =  'ありがとう・・・ありがとう・・・';
        return client.replyMessage(replyToken, 

            [
                {
                'type': 'text',
                'text': resMessage
            },
           
            {
                'type': 'image',
                'originalContentUrl': 'https://www.kaiteki-lab.info/info/wp-content/uploads/2014/08/18042_220731_v2.jpg',
                'previewImageUrl':'https://www.kaiteki-lab.info/info/wp-content/uploads/2014/08/18042_220731_v2.jpg'

            }]
            );


    //残高

        }else if (reqMessage === '残高') {

            return client.replyMessage(
                replyToken, 
                {
                    'type': 'text',
                    'text': '9,940,000円です'
                }
            );
        }
    
    

     
    
//振込



else if (reqMessage === '証券会社に振込') {
    options = {
        'method': 'POST',
        'url':  API_ENDPOINT,
        'headers': {
            'Accept': 'application/json;charset=UTF-8',
            'Content-Type': 'application/json;charset=UTF-8',
            'x-access-token':  API_TOKEN
        },
        body: '{ \n	"accountId":"301010006996",\n	"transferDesignatedDate":"2023-07-14", \n	"transferDateHolidayCode":"1", \n	"totalCount":"1", \n	"totalAmount":"500000", \n	"transfers":\n	[\n		{ \n			"itemId":"1", \n			"transferAmount":"500000", \n			"beneficiaryBankCode":"0310",\n			"beneficiaryBranchCode":"301", \n			"accountTypeCode":"1", \n			"accountNumber":"0000277", \n			"beneficiaryName":"ｽﾅﾊﾞ ﾂｷﾞｵ"\n		}\n	] \n}'
    };

    await request(options).then(function (response) {
        resMessage = 'GMOコイン株式会社への振込受付完了しました。ログインしてお知らせかパスワードを入力してください。https://bank.sunabar.gmo-aozora.com/';
    }).catch(function (error) {
        throw new Error(error);
    });

    return client.replyMessage(
        replyToken,
         [
            {'type': 'text',
            'text': resMessage
        },

        {'type': 'text',
            'text': 'NPO保護猫活動団体にも振込金額の3%寄付として振込いたしました。'
        },

        {
            'type': 'image',
            'originalContentUrl' : 'https://1.bp.blogspot.com/-rd13c_PYCHc/XexqupELsMI/AAAAAAABWiY/xPZ4z_kh9Wo5plD3VNp1PqRe66RbBX1IgCNcBGAsYHQ/s1600/kotowaza_neko_koban.png',
            'previewImageUrl': 'https://1.bp.blogspot.com/-rd13c_PYCHc/XexqupELsMI/AAAAAAABWiY/xPZ4z_kh9Wo5plD3VNp1PqRe66RbBX1IgCNcBGAsYHQ/s1600/kotowaza_neko_koban.png'
        }


                    
    ]);



        //振替
    }else if (reqMessage === 'ビットコイン振替') {
        let request = require('request');
        resMessage = 'ビットコイン用口座から親口座に500,000円振替ました';
        let options = {
                'method': 'POST',
                'url': API_ENDPOINT,
                'headers': {
                    'Accept': 'application/json;charset=UTF-8',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'x-access-token': API_TOKEN
                },
         body: '{ \r\n	"depositSpAccountId":"SP30110006996",\r\n	"debitSpAccountId":"SP50220520461",\r\n	"currencyCode":"JPY",\r\n	"paymentAmount":"500000"\r\n}'

            };
            request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            });

        return client.replyMessage(
            replyToken,
             
                {'type': 'text',
                'text': resMessage
            },
           
        );

    } else {
        return client.replyMessage(
            replyToken, {
                'type': 'text',
                'text': 'ブートキャンプ楽しんでるかい？'
            });
        }
    
}
