// Realizado por Sebastián Tomás (Thomse) para Olympo WoW.
// @sebastomass

const request = require('request-promise');
const cheerio = require('cheerio');
let getMeta = require('lets-get-meta');
const armoryUrl = "http://www.olympowow.com/web/character/1/";
// const fs = require('fs');



// Hace la request a la armería pasando como parametro el nombre del personaje.
async function getCharacterInfo(characterName) {
    let html = "";
    await request(armoryUrl+characterName).then(function (htmlString) {
        html = htmlString;
    });
    return html;
}

// Se utiliza para obtener el nombre de un item pasando su id como parametro.
async function getWeaponName(id){
    let html = "";
    let weaponUrl = "http://www.olympowow.com/web/item/1/"+id;
    await request(weaponUrl).then(function (htmlString) {
        html = htmlString;
    });
    let cheer = await cheerio.load(html);
    return cheer("#item_space > div.item_bg.tooltip > div > span.q4").text();
}


// Devuelve un JSON con toda la información del personaje.
async function getCharacterJSON(characterName) {
    let res = await getCharacterInfo(characterName);
    let cheer = await cheerio.load(res);
    let info = (getMeta(res).keywords).split(",");
    let name = info[1];
    let lvl = info[2].split("v")[1];
    let health = cheer("#armory_health").text();
    health = health.split(" ")[1];
    let mana = cheer("#armory_mana").text();
    mana = mana.split(" ")[1];
    let character = await {name: name, level: lvl, health: health, mana: mana, race: info[3], class: info[4], stats: getCharacterStatsJSON(cheer),
        inventory: await getInventoryJSON(cheer)};
    return await character;
}

// Retorna el JSON con las características del personaje.
function getCharacterStatsJSON(cheer){
    let stats = {};
    // General stats
    let strength = cheer("#tab_armory_1 > table > tr:nth-child(1) > td:nth-child(2)").text();
    let stamina = cheer("#tab_armory_1 > table > tr:nth-child(2) > td:nth-child(2)").text();
    let intellect = cheer("#tab_armory_1 > table > tr:nth-child(3) > td:nth-child(2)").text();
    let spellPower = cheer("#tab_armory_1 > table > tr:nth-child(4) > td:nth-child(2)").text();
    let attPower = cheer("#tab_armory_1 > table > tr:nth-child(5) > td:nth-child(2)").text();
    let resilience = cheer("#tab_armory_2 > table > tr:nth-child(1) > td:nth-child(2)").text();
    let armor = cheer("#tab_armory_2 > table > tr:nth-child(2) > td:nth-child(2)").text();
    let block = cheer("#tab_armory_2 > table > tr:nth-child(3) > td:nth-child(2)").text();
    let dodge = cheer("#tab_armory_2 > table > tr:nth-child(4) > td:nth-child(2)").text();
    let parry = cheer("#tab_armory_2 > table > tr:nth-child(5) > td:nth-child(2)").text();
    let meleeCrit = cheer("#tab_armory_3 > table > tr:nth-child(1) > td:nth-child(2)").text();
    let rangedCrit = cheer("#tab_armory_3 > table > tr:nth-child(2) > td:nth-child(2)").text();
    let spellCrit = cheer("#tab_armory_3 > table > tr:nth-child(3) > td:nth-child(2)").text();
    let spirit = cheer("#tab_armory_3 > table > tr:nth-child(4) > td:nth-child(2)").text();
    // PVP Stats
    let totalKills = cheer("#tab_pvp > table >  tr:nth-child(1) > td:nth-child(2)").text();
    let honorPoints = cheer("#tab_pvp > table >  tr:nth-child(2) > td:nth-child(2)").text();
    let arenaPoints = cheer("#tab_pvp > table >  tr:nth-child(3) > td:nth-child(2)").text();
    stats.general = {strength: strength, stamina: stamina, intellect: intellect, spellPower: spellPower, attPower: attPower,
        resilience: resilience, armor: armor, block: block, dodge: dodge, parry: parry, meleeCrit: meleeCrit, rangedCrit: rangedCrit,
        spellCrit: spellCrit, spirit: spirit};
    stats.pvp = {totalKills: totalKills, honorPoints: honorPoints, arenaPoints: arenaPoints};
    return stats;
}


// Retorna un json con el inventario actual del personaje.
async function getInventoryJSON(cheer) {
    let inventory = {};
    if(cheer("#armory_left > div:nth-child(1)").children().length === 3){
        inventory.head = {id: cheer("#armory_left > div:nth-child(1) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(1) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.head = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_left > div:nth-child(2)").children().length === 3){
        inventory.neck = {id: cheer("#armory_left > div:nth-child(2) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(2) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.neck = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_left > div:nth-child(3)").children().length === 3){
        inventory.shoulder = {id: cheer("#armory_left > div:nth-child(3) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(3) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.shoulder = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_left > div:nth-child(4)").children().length === 3){
        inventory.back = {id: cheer("#armory_left > div:nth-child(4) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(4) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.back = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_left > div:nth-child(5)").children().length === 3){
        inventory.robe = {id: cheer("#armory_left > div:nth-child(5) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(5) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.robe = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_left > div:nth-child(6)").children().length === 3){
        inventory.shirt = {id: cheer("#armory_left > div:nth-child(6) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(6) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.shirt = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_left > div:nth-child(7)").children().length === 3){
        inventory.tabard = {id: cheer("#armory_left > div:nth-child(7) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(7) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.tabard = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_left > div:nth-child(8)").children().length === 3){
        inventory.wrists = {id: cheer("#armory_left > div:nth-child(8) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_left > div:nth-child(8) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.wrists = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(1)").children().length === 3){
        inventory.hands = {id: cheer("#armory_right > div:nth-child(1) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(1) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.hands = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(2)").children().length === 3){
        inventory.waist = {id: cheer("#armory_right > div:nth-child(2) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(2) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.waist = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(3)").children().length === 3){
        inventory.legs = {id: cheer("#armory_right > div:nth-child(3) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(3) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.legs = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(4)").children().length === 3){
        inventory.feet = {id: cheer("#armory_right > div:nth-child(4) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(4) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.feet = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(5)").children().length === 3){
        inventory.finger1 = {id: cheer("#armory_right > div:nth-child(5) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(5) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.finger1 = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(6)").children().length === 3){
        inventory.finger2 = {id: cheer("#armory_right > div:nth-child(6) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(6) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.finger2 = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(7)").children().length === 3){
        inventory.trinket1 = {id: cheer("#armory_right > div:nth-child(7) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(7) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.trinket1 = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_right > div:nth-child(8)").children().length === 3){
        inventory.trinket2 = {id: cheer("#armory_right > div:nth-child(8) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_right > div:nth-child(8) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.trinket2 = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_bottom > div:nth-child(1)").children().length === 3){
        inventory.mainHand = {id: cheer("#armory_bottom > div:nth-child(1) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_bottom > div:nth-child(1) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.mainHand = {id: "", name: "<<Not equipped item>>"}}

    if(cheer("#armory_bottom > div:nth-child(2)").children().length === 3){
        inventory.holdable = {id: cheer("#armory_bottom > div:nth-child(2) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_bottom > div:nth-child(2) > a:nth-child(2)").attr("rel-e").split("=")[1])};
        console.log("cacaca");
    }else{inventory.holdable = {id: "", name: "<<Not equipped item>>"};}

    if(cheer("#armory_bottom > div:nth-child(3)").children().length === 3){
        inventory.relicOrRanged = {id: cheer("#armory_bottom > div:nth-child(3) > a:nth-child(2)").attr("rel-e").split("=")[1],
            name: await getWeaponName(cheer("#armory_bottom > div:nth-child(3) > a:nth-child(2)").attr("rel-e").split("=")[1])};
    }else{inventory.relicOrRanged = {id: "", name: "<<Not equipped item>>"}}

    return inventory;
}

// Retorna un JSON con la lista de jugadores conectados actualmente, junto a su nivel y su localización dentro del juego.
async function getOnlinePlayers(){
    let html = "";
    const url = "http://www.olympowow.com/web/online";
    let onlinePlayersJSON = {};
    await request(url).then(function (htmlString) {
        html = htmlString;
    });
    let cheer = await cheerio.load(html);
    let table = cheer("#online_realm_1").text().trim();
    let tableArray = table.split("\n");
    let index = 0;
    let nameIndex = 8;
    let lvlIndex = 9;
    let locationIndex = 12;
    for(i in tableArray){
        onlinePlayersJSON[index] = {name: tableArray[nameIndex].trim(), level: tableArray[lvlIndex].trim(), location: tableArray[locationIndex].trim()};
        nameIndex += 7;
        lvlIndex += 7;
        locationIndex += 7;
        index++;
        if(locationIndex === tableArray.length-1){
            onlinePlayersJSON[index] = {name: tableArray[nameIndex].trim(), level: tableArray[lvlIndex].trim(), location: tableArray[locationIndex].trim()};
            return onlinePlayersJSON;
        }
    }
}


// Funciones que se exportan del módulo.
module.exports = {
    getCharacter: async (characterName) => {
        return await getCharacterJSON(characterName);
    },
    getOnlinePlayers: async () =>{
        return await getOnlinePlayers();
    }
};



// -- Función que genera un JSON con todas las guilds, ojalá no tener que volver a utilizarla. --
// async function getAllGuilds() {
//     let html = "http://www.olympowow.com/web/guild/1/";
//     let guilds = {};
//     let guildsJSONIndex = 0;
//     for(let i = 1; i <  6000; i++){
//         await request(html+""+i).then(function(guildhtml){
//             let cheer = cheerio.load(guildhtml);
//             let name = cheer("#guild_name > font").text();
//             console.log("Id: "+i+" -- " + "Name: "+ name);
//             guilds[guildsJSONIndex] = {id: i, name: name};
//             guildsJSONIndex++;
//         });
//     }
//     return guilds;
// }getAllGuilds().then(success => {
//    fs.writeFile("guilds.json", JSON.stringify(success));
//    console.log("job is done :D");
// });
