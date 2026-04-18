const firebaseConfig = { 
    apiKey: "AIzaSyAuQAVMtIGGxSWv4XQIMJyyA4nmwLtiYq8", 
    databaseURL: "https://the-lost-songs-of-the-tavern-default-rtdb.firebaseio.com", 
    projectId: "the-lost-songs-of-the-tavern" 
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let myName, myData, selectedAbility, currentTurnPlayer, hasUsedReaction = false, hasAttacked = false;

const classData = {
    "Wizard": [{n:"⌛ Warp",l:1,c:4,t:"target",fx:"warp",desc:"Vertraagt de tijd voor doelwit."},{n:"👁 Look",l:2,c:8,t:"self",desc:"Geeft een visioen van de actie."},{n:"🌀 Echo",l:4,c:12,t:"target",desc:"Herhaalt de laatste actie."},{n:"🎵 Reverb",l:8,c:15,t:"target",desc:"Versterkt de volgende aanval (+5 Schade)."},{n:"⚡ Bass Boost",l:10,c:20,t:"target",d:10,fx:"flash",desc:"10 HP Schade."},{n:"🛡 Vinyl Shield",l:12,c:25,t:"self",h:5,desc:"Blokkeert 5 HP."},{n:"🔥 Scratch",l:15,c:30,t:"target",d:18,fx:"flash",desc:"18 HP Schade."},{n:"🌟 Mastering",l:20,c:50,t:"self",h:99,desc:"Onoverwinnelijk."}],
    "Bard": [{n:"🎸 Solo",l:1,c:5,t:"self",desc:"Verhoogt eigen geluk."},{n:"💤 Lullaby",l:2,c:10,t:"target",fx:"sleep",desc:"Slaap (2 beurten)."},{n:"🎤 Chorus",l:4,c:18,t:"target",h:8,desc:"8 HP Herstel."},{n:"🔀 Remix",l:8,c:22,t:"target",desc:"Reset stats."},{n:"🔊 Amplifier",l:10,c:25,t:"self",desc:"Double damage."},{n:"🎼 Symphony",l:12,c:35,t:"target",h:12,desc:"Team Heal."},{n:"🔁 Encore",l:15,c:45,t:"self",desc:"Extra beurt."},{n:"🏆 Chart Topper",l:20,c:65,t:"target",d:25,desc:"25 HP + Coin steel."}],
    "Rogue": [{n:"🗡 Stab",l:1,c:3,t:"target",d:3,desc:"3 HP Schade."},{n:"🌫 Smoke Screen",l:2,c:7,t:"target",fx:"smoke",desc:"Ontwijk aanval."},{n:"💰 Pickpocket",l:4,c:12,t:"target",desc:"Steel 5 coins."},{n:"🕸 Tripwire",l:8,c:16,t:"target",fx:"sleep",desc:"Stun (2 beurten)."},{n:"🧪 Poison",l:10,c:24,t:"target",d:5,fx:"poison",desc:"5 HP per ronde."},{n:"👣 Shadow Step",l:12,c:30,t:"self",desc:"Onzichtbaar."},{n:"🔪 Backstab",l:15,c:40,t:"target",d:18,desc:"Negeert defense."},{n:"💀 Assassinate",l:20,c:60,t:"target",d:30,desc:"De genadeslag."}],
    "Paladin": [{n:"🛡 Smite",l:1,c:6,t:"target",d:5,desc:"5 HP Schade."},{n:"✨ Cleanse",l:2,c:9,t:"target",desc:"Verwijder FX."},{n:"🤝 Guardian",l:4,c:14,t:"target",desc:"Vang schade op."},{n:"💿 Holy Vinyl",l:8,c:22,t:"self",h:15,desc:"15 HP Herstel."},{n:"🔅 Aura",l:10,c:28,t:"self",desc:"Team Mana."},{n:"🧱 Wall of Sound",l:12,c:38,t:"self",h:10,desc:"Team Shield."},{n:"⚖ Judgement",l:15,c:48,t:"target",d:20,desc:"20 HP Schade."},{n:"👼 Resurrection",l:20,c:85,t:"target",h:15,desc:"Breng dode terug."}],
    "Wench": [{n:"🍺 Serve",l:1,c:4,t:"target",desc:"Geeft Mana."},{n:"🍲 Stew",l:2,c:8,t:"target",h:6,desc:"6 HP Herstel."},{n:"🧹 Sweep",l:4,c:12,t:"target",d:2,desc:"Stun (2 beurten)."},{n:"🍷 Fine Wine",l:8,c:20,t:"target",desc:"Buff stats."},{n:"📣 Gossip",l:10,c:25,t:"target",desc:"Drain Mana."},{n:"🍗 Feast",l:12,c:35,t:"target",h:20,desc:"20 HP Herstel."},{n:"🍳 Iron Skillet",l:15,c:42,t:"target",d:15,desc:"15 HP Schade."},{n:"🏰 Grand Banquet",l:20,c:70,t:"self",h:50,desc:"Full Team Heal."}],
    "Bouncer": [{n:"👊 Punch",l:1,c:5,t:"target",d:6,desc:"6 HP Schade."},{n:"🤚 Block",l:2,c:10,t:"self",desc:"50% Damage Reduction."},{n:"Door Eject",l:4,c:15,t:"target",d:4,desc:"Stun (2 beurten)."},{n:"🧱 The Wall",l:8,c:25,t:"self",desc:"Onbeweeglijk."},{n:"😤 Intimidate",l:10,c:30,t:"target",desc:"Verlaag Atk."},{n:"💥 Ground Slam",l:12,c:40,t:"target",d:12,desc:"AoE Schade."},{n:"⛓ Lockdown",l:15,c:50,t:"target",desc:"Blokkeer abilities."},{n:"🐘 Stampede",l:20,c:75,t:"target",d:35,desc:"35 HP Schade."}],
    "Monk": [{n:"🧘 Focus",l:1,c:2,t:"self",desc:"Mana korting."},{n:"🧤 Palm Strike",l:2,c:6,t:"target",d:5,desc:"Steel Mana."},{n:"👣 Dash",l:4,c:10,t:"self",desc:"Teleport."},{n:"🌀 Inner Peace",l:8,c:18,t:"self",desc:"Mana regen."},{n:"🤜 Combo Kick",l:10,c:26,t:"target",d:14,desc:"14 HP Schade."},{n:"☁ Cloud Walk",l:12,c:34,t:"self",desc:"Vlieg."},{n:"☸ Zen Moment",l:15,c:45,t:"self",desc:"Tijdelijk Gratis."},{n:"⛩ Nirvana",l:20,c:80,t:"self",h:50,desc:"Reset stats."}],
    "Necro": [{n:"💀 Raise",l:1,c:6,t:"target",d:3,fx:"poison",desc:"Dot schade."},{n:"🧛 Soul Tap",l:2,c:10,t:"target",d:5,hSelf:5,desc:"Life steal."},{n:"⚰ Decay",l:4,c:16,t:"target",d:3,fx:"poison",desc:"Corrosie."},{n:"bat",l:8,c:24,t:"target",d:6,desc:"Blind vijand."},{n:"🦴 Bone Shield",l:10,c:32,t:"self",h:8,desc:"8 HP Shield."},{n:"🌑 Curse",l:12,c:40,t:"target",desc:"-50% Mana vijand."},{n:"🧟 Zombie Groove",l:15,c:55,t:"target",fx:"zombify",desc:"Maak Zombie."},{n:"🌌 Army",l:20,c:90,t:"self",d:40,desc:"40 HP Schade."}],
    "Druid": [{n:"🌿 Entangle",l:1,c:5,t:"target",d:2,desc:"Vastzetten."},{n:"🐻 Bear Form",l:2,c:10,t:"self",h:10,desc:"+10 HP."},{n:"🐝 Bee Swarm",l:4,c:14,t:"target",d:5,fx:"poison",desc:"Schade."},{n:"🍄 Spores",l:8,c:20,t:"target",fx:"smoke",desc:"Mist."},{n:"🦅 Eagle Eye",l:10,c:25,t:"self",desc:"100% Hit."},{n:"🌳 Ironwood",l:12,c:35,t:"self",h:12,desc:"Shield."},{n:"🐺 Pack Hunter",l:15,c:45,t:"target",d:22,desc:"22 HP Schade."},{n:"⛈️ Nature",l:20,c:75,t:"target",d:35,desc:"35 HP Schade."}],
    "Gravedigger": [{n:"⚰️ Bury",l:1,c:4,t:"target",d:14,fx:"poison",desc:"14 HP Schade."},{n:"🕯️ Holy Candle",l:2,c:8,t:"self",desc:"Anti-vloek."},{n:"⛓️ Shackle",l:4,c:15,t:"target",fx:"lock",desc:"BLOKKEER ALLES."},{n:"🌑 Deep Dig",l:8,c:22,t:"target",d:8,fx:"sleep",desc:"Stun + 8 HP (2 beurt)."},{n:"🛡️ Iron Casket",l:10,c:30,t:"self",h:15,desc:"15 HP Blok."},{n:"⚖️ Exorcism",l:12,c:42,t:"target",d:20,desc:"Holy damage."},{n:"⛪ Ground",l:15,c:55,t:"self",desc:"Team Immuniteit."},{n:"🪦 RIP",l:20,c:80,t:"target",fx:"zombify",desc:"Maak Zombie."}],
    "Zombie": [
        {n:"🧠 Braaaaains!",l:1,c:0,t:"target",d:20,hSelf:5,desc:"Eet hersenen en herstel HP."},
        {n:"🖐️ Slap",l:1,c:0,t:"target",d:25,desc:"Een flinke mep."},
        {n:"🤮 Toxic Puke",l:1,c:0,t:"target",d:15,fx:"poison",desc:"Spuug gif over je vijand."},
        {n:"🦴 Bone Throw",l:1,c:0,t:"target",d:35,dSelf:10,desc:"Gooi je eigen ribbenkast! (-10 HP)"},
        {n:"☣️ Infection",l:1,c:0,t:"target",fx:"zombify",desc:"Alleen op vergiftigde vijanden!"}
    ]
};

const teksten = ["Wat een loser! 🤡", "Echt waar? Alweer? 🤦‍♂️", "Dat was pijnlijk om naar te kijken...", "Game Over, pannenkoek! 🥞", "Error 404: Skills niet gevonden. 🚫", "Je bent een wandelende blunder. 🚫"];

function enterTavern() {
    myName = document.getElementById('login-name').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;
    const cls = document.getElementById('login-class').value;
    if(!myName || !pass) return alert("Naam/Wachtwoord!");
    db.ref('accounts/' + myName).once('value', snap => {
        if(snap.exists()) {
            if(snap.val().password === pass) startApp(); else alert("Fout wachtwoord!");
        } else {
            db.ref('accounts/' + myName).set({password:pass, class:cls, originalClass:cls, hp:500, mana:30, coins:20, exp:0, level:1, isLocked:false, zombieTimer:0, sleepTimer:0, pendingFX:null}).then(() => startApp());
        }
    });
}

function startApp() {
    document.getElementById('login-screen').style.display='none';
    document.getElementById('main-app').style.display='block';
    db.ref('current_turn').on('value', snap => {
        currentTurnPlayer = snap.val();
        hasAttacked = false; hasUsedReaction = false;
        document.getElementById('end-turn-btn').style.display = (currentTurnPlayer === myName) ? 'block' : 'none';
        updateTurnUI(); renderAbilities();
    });
    db.ref('accounts/' + myName).on('value', snap => {
        myData = snap.val(); if(!myData) return;
        updateUI(); renderAbilities();
    });
    db.ref('accounts').on('value', snap => {
        let html = "";
        snap.forEach(p => {
            const pd = p.val();
            let statusInfo = "";
            if(pd.zombieTimer > 0) statusInfo = `(ZOMBIE ${pd.zombieTimer})`;
            else if(pd.sleepTimer > 0) statusInfo = `(SLAAP ${pd.sleepTimer})`;
            html += `• ${p.key.toUpperCase()}: ${pd.hp}HP | ${pd.class} ${statusInfo}<br>`;
        });
        document.getElementById('player-status-list').innerHTML = html;
    });
}

function updateUI() {
    if(myData.hp <= 0) { toonDoodScherm(); } else { document.getElementById('death-screen').style.display = 'none'; }
    
    let stText = "NORMAAL";
    let stColor = "white";

    if (myData.class === "Zombie") { stText = "ZOMBIE 🧟"; stColor = "var(--green)"; }
    else if (myData.isLocked) { stText = "GEKETEND ⛓️"; stColor = "var(--red)"; }
    else if (myData.pendingFX === "poison") { stText = "VERGIFTIGD 🤮"; stColor = "#a2b78d"; }
    else if (myData.pendingFX === "sleep") { stText = `IN SLAAP 💤 (${myData.sleepTimer || 0})`; stColor = "var(--blue)"; }

    document.getElementById('disp-name').innerText = myName.toUpperCase() + " (" + myData.class + ")";
    document.getElementById('stat-container').innerHTML = `
        <div class="stat-box">HP: ${myData.hp}</div>
        <div class="stat-box">MP: ${myData.mana}</div>
        <div class="stat-box">Coins: ${myData.coins}</div>
        <div class="stat-box">LVL: ${myData.level}</div>
        <div class="stat-box" style="grid-column: span 2; border-color: ${stColor}; color: ${stColor}">STATUS: ${stText}</div>
    `;

    document.getElementById('zombie-timer-display').innerText = (myData.zombieTimer > 0) ? `ZOMBIE VLOEK: ${myData.zombieTimer} BEURTEN` : "";
    document.getElementById('game-body').className = (myData.class === "Zombie") ? "zombie-mode" : "";
}

function toonDoodScherm() {
    const msgEl = document.getElementById("death-message");
    const screenEl = document.getElementById("death-screen");
    if (screenEl.style.display !== "flex") {
        msgEl.innerText = teksten[Math.floor(Math.random() * teksten.length)];
        screenEl.style.display = "flex";
        document.getElementById('res-btn').style.opacity = (myData.coins >= 20) ? "1" : "0.5";
    }
}

function renderAbilities() {
    const container = document.getElementById('ability-container');
    if(!container || !myData) return; container.innerHTML = "";
    let canAct = (currentTurnPlayer === myName) ? !hasAttacked : !hasUsedReaction;
    
    if(myData.isLocked) { container.innerHTML = "<h3>JE BENT GEKETEND!</h3>"; }
    else if (myData.pendingFX === "sleep" && (myData.sleepTimer || 0) > 0) { 
        container.innerHTML = `<h3>ZZZZ... NOG ${myData.sleepTimer} BEURTEN</h3>`; 
    }
    else if (!canAct) { container.innerHTML = "<h3>WACHT OP BEURT...</h3>"; }
    else {
        const r = document.createElement('div'); r.className = `ability-btn`; r.style.borderLeft = "4px solid var(--green)";
        r.innerHTML = `<b>💤 Rusten</b><i>+10 HP / +5 MP</i><span class="mana-tag">0 MP</span>`;
        r.onclick = () => { db.ref('accounts/'+myName).update({hp:myData.hp+10, mana:myData.mana+5}); finishAction(); };
        container.appendChild(r);

        const list = classData[myData.class] || classData["Zombie"];
        list.forEach(a => {
            const btn = document.createElement('div'); const lock = myData.level < a.l;
            btn.className = `ability-btn ${lock ? 'disabled' : ''}`;
            btn.innerHTML = `<b>${a.n}</b><i>${a.desc}</i><span class="mana-tag">${lock ? 'LVL '+a.l : a.c+' MP'}</span>`;
            if(!lock) btn.onclick = () => { if(myData.mana >= a.c) { selectedAbility = a; if(a.t === 'target') openPicker(); else execute(myName); } else alert("Geen mana!"); };
            container.appendChild(btn);
        });
    }
}

function execute(targetName) {
    closeOverlay();
    const a = selectedAbility;
    
    if (a.fx && a.fx.toLowerCase() === 'zombify' && myData.class.toLowerCase() === "zombie") {
        db.ref('accounts/' + targetName).once('value', snap => {
            const targetData = snap.val();
            if (!targetData.pendingFX || targetData.pendingFX.toLowerCase() !== 'poison') { 
                alert("❌ Infectie mislukt: Het doelwit moet eerst VERGIFTIGD zijn!"); 
            } else { doZombify(targetName, targetData); finishAction(); }
        });
        return;
    }

    if (a.fx === 'zombify') {
        db.ref('accounts/' + targetName).once('value', snap => { doZombify(targetName, snap.val()); finishAction(); });
        return;
    }

    db.ref('accounts/' + myName + '/mana').transaction(m => Math.max(0, m - a.c));
    if(a.d) db.ref('accounts/' + targetName + '/hp').transaction(h => h - a.d);
    if(a.dSelf) db.ref('accounts/' + myName + '/hp').transaction(h => h - a.dSelf);
    if(a.h) db.ref('accounts/' + targetName + '/hp').transaction(h => h + a.h);
    if(a.hSelf) db.ref('accounts/' + myName + '/hp').transaction(h => h + a.hSelf);
    
    let updates = {};
    if(a.fx === 'lock') updates.isLocked = true;
    if(a.fx && a.fx !== 'lock' && a.fx !== 'zombify') {
        updates.pendingFX = a.fx;
        if(a.fx === 'sleep') updates.sleepTimer = 2; 
    }
    if(Object.keys(updates).length > 0) db.ref('accounts/' + targetName).update(updates);
    finishAction();
}

function doZombify(tName, tData) {
    db.ref('accounts/' + tName).update({ 
        originalClass: tData.class, 
        preZombieHP: tData.hp,
        class: 'Zombie', 
        zombieTimer: 3, 
        hp: 20000, 
        pendingFX: null, 
        sleepTimer: 0 
    });
}

function finishAction() {
    if(currentTurnPlayer === myName) hasAttacked = true; else hasUsedReaction = true;
    updateTurnUI(); renderAbilities();
}

function passTurn() {
    db.ref('accounts').once('value', snap => {
        const keys = Object.keys(snap.val());
        const nextIndex = (keys.indexOf(currentTurnPlayer) + 1) % keys.length;
        const nextPlayer = keys[nextIndex];
        const npData = snap.val()[nextPlayer];

        if(npData) {
            let turnUpdates = {};
            if(npData.pendingFX === "poison") {
                db.ref('accounts/' + nextPlayer + '/hp').transaction(h => h - 10);
            }
                if(npData.pendingFX === "sleep"){
					let st = (npData.sleepTimer || 1) - 1;
                    turnUpdates.sleepTimer = st;
                    if(st <= 0) turnUpdates.pendingFX = null;  
            }
            if(npData.class === "Zombie") {
                let zt = (npData.zombieTimer || 1) - 1;
                if(zt <= 0) {
                    let oldHP = npData.preZombieHP || 500;
                    turnUpdates.class = npData.originalClass || "Wizard";
                    turnUpdates.zombieTimer = 0;
                    turnUpdates.hp = oldHP - 30;
                    turnUpdates.preZombieHP = null;
                    alert(nextPlayer.toUpperCase() + " is geen Zombie meer!");
                } else {
                    turnUpdates.zombieTimer = zt;
                }
            }
            if(Object.keys(turnUpdates).length > 0) db.ref('accounts/' + nextPlayer).update(turnUpdates);
        }
        db.ref('current_turn').set(nextPlayer);
    });
}

function updateTurnUI() {
    const el = document.getElementById('turn-indicator');
    if(currentTurnPlayer===myName) { el.innerHTML= hasAttacked ? "BEURT GEBRUIKT" : "JOUW BEURT ✅"; el.className='status-active'; }
    else if(!hasUsedReaction) { el.innerHTML="REACTIE ⚡"; el.className='status-ready'; }
    else { el.innerHTML="WACHTEN ⏳"; el.className='status-wait'; }
}

function openPicker() {
    db.ref('accounts').once('value', snap => {
        const list = document.getElementById('target-list'); list.innerHTML = "";
        snap.forEach(c => {
            const btn = document.createElement('button'); btn.className="btn-gold"; btn.innerText= c.key.toUpperCase();
            btn.onclick=()=>execute(c.key); list.appendChild(btn);
        });
        document.getElementById('target-overlay').style.display='flex';
    });
}

function closeOverlay() { document.getElementById('target-overlay').style.display='none'; }
function resurrect() { if(myData.coins >= 20) db.ref('accounts/'+myName).update({hp: 500, mana: 30, coins: myData.coins - 20, isLocked: false, pendingFX: null, sleepTimer: 0, zombieTimer: 0}); }
function permDeath() { if(confirm("Karakter wissen?")) db.ref('accounts/'+myName).remove().then(()=>location.reload()); }
function cleanseAll() { db.ref('accounts').once('value', s => s.forEach(p => db.ref('accounts/'+p.key).update({isLocked:false, pendingFX:null, sleepTimer:0, zombieTimer:0}))); }