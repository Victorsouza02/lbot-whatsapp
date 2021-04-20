const db = require('./database')
const {criarTexto, consoleErro} = require('./util')
const {botInfo} = require("./bot")
const msgs_texto = require("./msgs")

module.exports = antitrava = async (client, message) => {
    try{
        const {sender, from, isGroupMsg, body, chat, caption } = message
        var conteudo = caption || body || ''
        if(isGroupMsg){ //ANTI-TRAVA NO GRUPO
            const groupId = isGroupMsg ? chat.groupMetadata.id : ''
            const antitrava = await db.obterDadosAntiTrava(groupId)
            if(antitrava.status){
                const botNumber = await client.getHostNumber()
                const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
                const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
                const isAdmin = isGroupMsg ? groupAdmins.includes(sender.id) : false
                if(isBotGroupAdmins){
                    if(!isAdmin){
                        var antiTrava = await db.obterDadosAntiTrava(groupId)
                        if(conteudo.length > antiTrava.max_caracteres) {
                            await client.removeParticipant(groupId, sender.id)
                            await client.sendTextWithMentions(from, criarTexto(msgs_texto.geral.resposta_ban, sender.id.replace("@c.us", ""), msgs_texto.grupo.antitrava.motivo, botInfo().nome))
                            return
                        }
                    }
                } else {
                    await db.alterarAntiTrava(groupId, false, 0)
                }
            }   
        } else { //ANTI-TRAVA NO PV
            var bot = botInfo()
            if(bot.antitrava.status){
                const isOwner = sender.id.replace("@c.us","") == process.env.NUMERO_DONO.trim()
                if(!isOwner){
                    if(conteudo.length > bot.antitrava.max_caracteres){
                        await client.contactBlock(sender.id)
                    }
                }
            }
        }
    } catch(err){
        consoleErro(err.message, 'ANTI-TRAVA')
    }
        
}