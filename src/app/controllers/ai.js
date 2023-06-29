/*---------------------------------------------------------------------------------------------
 * AI
 *--------------------------------------------------------------------------------------------*/

const
io = require("../../lib/utils/fio")
// , { Configuration, OpenAIApi } = require("openai")
, cache = require("../../lib/utils/fcache")
, date = require("../../lib/utils/fdate")
// , openai = new OpenAIApi(new Configuration({ apiKey: process.env.AI_SECRET }))
;;

module.exports = class ai {

    static async models(req) {
        if(req?.log) req.log({ stream: `fetching list of models from server`, progress:.2 })
        let res = cache.get('ai-models')?.data ;;
        if(!res) {
            res = await (await fetch("https://api.openai.com/v1/models", {
                method: 'GET'
                , withCredentials: true
                , credentials: 'include'
                , headers: { 'Authorization' : `Bearer ${process.env.AI_SECRET}`, 'Content-Type': 'application/json' }
            })).json()
            cache.set('ai-models', res, 1000 * 60 * 60 * 24)
        }
        if(req?.log) req.log({ stream: `fetched done`, progress:1 })
        return res
    }

    static async prompt(req) {
        let now = date.time() ;;
        const history = cache.get(req.device)?.data || {} ;;
        if(!(req?.prompt)) req.response = "invalid request. missing prompt!"
        else {
            history[now] = req.prompt
            if(req.log) req.log({ stream: `\n` + req.prompt, progress:.2 })
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer `+ process.env.AI_SECRET
                    },
                    body: JSON.stringify({
                        model               : req.model          || 'gpt-3.5-turbo'
                        , messages          : [{ role:'user', content:req.prompt }]
                        // , prompt            : req.prompt         || 'tell me to ask you something in a funny way'
                        , temperature       : req.temperature    || .1
                        , top_p             : req.top_p          || 1
                        , n                 : req.n              || 1
                        , presence_penalty  : req.presence_penalty  || 0
                        , frequency_penalty : req.frequency_penalty || 0
                    })
                }) ;;
                req.response = await response.json() ;;
            } catch(e) {
                if(VERBOSE) {
                    try { io.log(JSON.stringify(e.toJSON(), null, 4), 'ai') } catch(e) {}
                    console.trace(e)
                }
                req.response = 'err: ' + e.toString()
                req.error = e
            }
        }
        now = date.time()
        history[date.time()] = req.response
        if(req.log) req.log({ stream: `a: ` + (req.response?.choices ? req.response.choices[0]?.text?.slice(0,40) : "!"), progress:1 })
        cache.set(req.device, history, 1000 * 60 * 60 * 24 * 7)
        console.log(req.response)
        return req

    }

    static async chat(req) {
        if(!req?.data?.messages?.length) req.response = "invalid request. missing prompt!"
        else {
            // if(req.log) req.log({ stream: `\n` + req.data.messages?.map(i => i.content).join('\n') || "", progress:.2 })
            if(req.log) req.log({ progress:.2 })
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer `+ process.env.AI_SECRET
                    },
                    body: JSON.stringify({
                        model               : req.data.model             || 'text-davinci-003'
                        , messages          : req.data.messages         || [{ role:"user", content:"tell me to ask you something in a funny way" }]
                        , temperature       : req.data.temperature       || .2
                        // , max_tokens        : req.data.max_tokens        || 100
                        , top_p             : req.data.top_p             || 1
                        , n                 : req.data.n                 || 1
                        , presence_penalty  : req.data.presence_penalty  || 0
                        , frequency_penalty : req.data.frequency_penalty || 0
                    })
                }) ;;
                req.response = await response.json() ;;
            } catch(e) {
                if(VERBOSE) {
                    try { io.log(JSON.stringify(e.toJSON(), null, 4), 'ai') } catch(e) {}
                    console.trace(e)
                }
                req.response = 'err: ' + e.status + ' <- code'
                req.error = e
            }
        }
        if(req.log){
            // req.log({ stream: (req.response?.choices ? req.response.choices.length : "0") + " choices found for this question", progress:1 })
            req.response?.choices?.forEach((ch, i) => req.log({ stream: `        ${i+1} - ${ch.message.content}`, progress:1 }))
            req.log({ progress:1 })
        }
        return req

    }

}