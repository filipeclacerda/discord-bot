const Discord = require("discord.js")
const fetch = require("node-fetch")
const keepAlive = require("./server")
require('dotenv').config()
const Database = require("@replit/database")
const { response } = require("express")
const db = new Database()
const client = new Discord.Client()
const mySecret = process.env['TOKEN']
const sadWords = ["sad", "depressed", "unhappy", "angry"]
const yesSentence = ["Sim!", "Com certeza!", "Sem dúvidas!", "Claro!", "Certamente."]
const noSentence = ["Não", "Negativo.", "Não mesmo!", "Claro que não!", "Jamais!"]
const {google} = require('googleapis')
const google_api_key = process.env['GOOGLE_API_KEY']
const last_fm_api_key = process.env['LAST_FM_API_KEY']

client.on("message", msg => {
    if(msg.author.bot) return

    if(msg.content === "-sn"){
        msg.react('bota:597264472788303882')
        let DecisionResponse = takeADecision()
        msg.channel.send(DecisionResponse)
    }

    if(msg.content.startsWith("-sortear")){
        msg.react('bota:597264472788303882')
        let names = msg.content.split("-sortear ")[1].split("--q ")[0]
        let nameList = names.split(',')
        let quantityToSort = msg.content.split("--q ")[1]
        msg.channel.send((!quantityToSort) ? "O(A) sorteado(a) da vez foi: " : "A equipe sorteada foi: ")
        msg.channel.send(sortNames(nameList, quantityToSort))
        msg.channel.send(":partying_face: :partying_face: :partying_face:")
    }

    if(msg.content.startsWith("-smusica")){
        msg.react('bota:597264472788303882')
        let tag = msg.content.split("-smusica ")[1]
        getSongList(tag).then(data =>{
            msg.channel.send({ embed: data[0] })
            youtubeSearch(`${data[1]} - ${data[2]}`, msg)
        })

    }
    if(msg.content === "-ping"){
        msg.react('bota:597264472788303882')
        msg.reply("pong")
        msg.channel.send(msg.author.avatarURL())
    }
})


function takeADecision(){
    let yesOrNoNumber = getRandomNumber(2);
    let sentenceNumber = getRandomNumber(noSentence.length);
    if (yesOrNoNumber === 1) return yesSentence[sentenceNumber]
    else return noSentence[sentenceNumber]
}


function sortNames(nameList, quantityToSort = 1){
    let sortedNames = []
    for (let index = 0; index < quantityToSort; index++) {
        let randomNumber = getRandomNumber(nameList.length);
        sortedNames.push(nameList[randomNumber])
        nameList.splice(randomNumber, 1)
    }
    return sortedNames.join('\n');
}


async function requestMusicLastFM(tag = 'disco'){
    const axios = require("axios").default;
    const options = {
    method: 'GET',
    url: 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&format=json',
    params: {api_key: last_fm_api_key, tag: tag},
    };
    const response = await axios.request(options);
    return response.data.tracks
}


async function getSongList(tag){
    const tracks = await requestMusicLastFM(tag)
    const randomMusicNumber = getRandomNumber(50)
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(tracks.track[randomMusicNumber].name)
        .setDescription('Escolhemos uma música para você!')
        .setThumbnail(tracks.track[randomMusicNumber].image[3]['#text'])
        .addFields(
            { name: tracks.track[randomMusicNumber].artist.name, value: '\u200B' },
        )
        .setURL(tracks.track[randomMusicNumber].url)
    return [embed, tracks.track[randomMusicNumber].name ,tracks.track[randomMusicNumber].artist.name, ];
}


function getRandomNumber(maxSize){
    return Math.floor(Math.random()*maxSize)
}
const service = google.youtube({
    version: 'v3',
    auth:  google_api_key
})

async function youtubeSearch(search, msg){
    const res = await service.search.list({
        "part": [
            "snippet"
        ],
        "maxResults": 2,
        "q": search,
    }, (err, res)=>{
        if(err) return console.log(err)
        const videos = res.data.items;
        if (videos.length){
            msg.channel.send(`https://www.youtube.com/watch?v=${videos[0].id.videoId}`)
        }else{
            console.log('no videos found')
        }
    
    
})
}
keepAlive()
client.login(mySecret)