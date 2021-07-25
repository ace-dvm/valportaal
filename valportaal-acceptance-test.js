// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";


// let SERVER_PORT = process.argv[4];
// let BASE_URL = `http://127.0.0.1:${SERVER_PORT}`;
let BASE_URL = process.argv[4];

import {
    Selector
} from 'testcafe';

fixture `ValPortaalServer`;

// TODO: make launching of the Webserver the job of the test, and
// TODO: have each test launch a different instance on a different port

test('Check index', async t => {
    let url = `${BASE_URL}/index.html`;
    let window1 = await t.openWindow(url);

    let selector = Selector('body');

    // initial check that patient data is rendered
    await t.expect(selector.withText('Val Portaal').exists).ok()
});

let patient_export_data = [{
    "patient_id": 168,
    "medcat_name": "methocarbamol",
    "ATC_code": "M03BA03",
    "advice": "Stoppen via een afbouwschema. {{free text}}",
    "freetext": null,
    "prediction_result": 50
}, {
    "patient_id": 168,
    "medcat_name": "methocarbamol",
    "ATC_code": "M03BA03",
    "advice": "Overige opmerkingen: {{free text}}",
    "freetext": "My comment",
    "prediction_result": 50
}, {
    "patient_id": 168,
    "medcat_name": null,
    "ATC_code": "OTHER",
    "advice": "Uw arts heeft nog de volgende advies voor u over uw medicatie: {{free text}}",
    "freetext": "Please continue taking all other medications.",
	"prediction_result": 50
}, {
    "patient_id": 168,
    "medcat_name": "Valpreventie advies",
    "ATC_code": "NONMED",
    "advice": "<span class=\"patient_nonmed_category\">Valpreventie advies:</span>\n\n**Valpreventie bij ouderen. Wat kunt u zelf doen?** In deze tekst leest u wat u zelf kunt doen om vallen zoveel mogelijk te voorkomen. Er wordt ingegaan op een aantal factoren die het risico op vallen verhogen. Deze factoren hangen onderling samen en versterken elkaar. Deze informatietekst helpt na te gaan welke factoren bij u aanwezig zijn. U krijgt een aantal adviezen om het risico op vallen te verminderen. Hoe eerder u de gevaren aanpakt, hoe sneller het risico op vallen afneemt.\n**Voorkomen van vallen bij ouderen** Vallen bij oudere mensen is een ernstig en veelvoorkomend probleem. Ongeveer ??n op de drie nog thuiswonende ouderen valt minstens ??nmaal per jaar. Dit kan nare gevolgen hebben. Sommigen moeten na een val opgenomen worden in een zorgcentrum of ziekenhuis. Bij anderen ontstaat veel angst om opnieuw te vallen. Dit leidt tot onzekerheid bij gewone, dagelijkse bezigheden. Sommige ouderen gaan daarom minder het huis uit en raken sociaal ge?soleerd. Hoe eerder u de gevaren aanpakt, hoe sneller het risico op vallen afneemt.\n**Veilig bewegen, veilig schoeisel** Onveilig schoeisel met bijvoorbeeld gladde zolen of hoge hakken verhogen het valrisico verder. Veilig schoeisel heeft een goed profiel op de zool, een lage hak (max. 1 cm), is hoog sluitend (net onder de enkel) en heeft een goed, voorgevormd voetbed of een inlay die voetbed goed steunt. Loop (bij uit bed komen bijvoorbeeld) nooit op sokken maar gebruik altijd pantoffels die voldoen aan eerder genoemde eisen. Als u niet meer goed ter been bent, of zich onzeker voelt bij het lopen, kunt u gebruik maken van hulpmiddelen zoals een looprek (rollator) of een wandelstok. Deze kunt u aanschaffen via de thuiszorgwinkel. Een fysiotherapeut kan met u meekijken welk loophulpmiddel het meest geschikt voor u is. Risicoactiviteiten, zoals op een stoel gaan staan om iets hoog uit een kast te nemen, kunt u beter vermijden. Voor informatie over vergoedingen van deze hulpmiddelen kunt u terecht op de website &quot;Hulpmiddelenwijzer&quot; (https://www.hulpmiddelenwijzer.nl/) of bij uw zorgverzekering.\n**Pas op met alcohol** Als u ouder wordt, krijgt u meer last van bijwerkingen van alcohol. Alcohol heeft effect heeft op uw balans en uw bloedvaten. Uw bloedvaten verwijden waardoor u ook de volgende dag nog sneller last heeft van duizeligheid. Ga dus bewust om met alcohol.\n**Eet u sterk** Omdat uw spiermassa afneemt, is het advies om na uw 50ste extra te letten op het binnenkrijgen van voldoende eiwitten en vitamines.\n- De aanbevolen hoeveelheid eiwit voor ouderen is 1 gram/kg per dag. Eiwitten zitten met name in vlees, vis, melk(producten) en vleesvervangers.\n- Ouderen nemen minder makkelijk vitamine D op Daarom hebben ze vaak een vitamine D tekort. Vitamine D is van belang voor de kracht van uw botten en uw balans.\n- Kalk is de bouwsteen van uw botten. Eet 4 porties zuivel per dag, zeker als u last heeft van botontkalking. Voorbeeld: een plak kaas, een beker melk of yoghurt.\n**Ga naar de dokter** Vallen heeft vaak behandelbare oorzaken. Vallen kan ook een teken van een onderliggende ziekte zijn. Een val kan bijvoorbeeld een symptoom zijn van onderliggende problemen zoals een hartaandoening of een simpele blaasontsteking. Bij hernieuwd vallen is het dan ook altijd belangrijk om contact op te nemen met uw (huis)arts. Deze kan onderzoeken of er (nieuwe) oorzaken voor het vallen zijn ontstaan.",
    "freetext": null,
    "prediction_result": 50
}];

"use strict";

const fs = require('fs');
const portal_factory = require('./valportaal');

async function load_patient_168_data() {

    let portal = portal_factory.valportaal_init();
    try {
        await portal.setAdviceForPatient(168, patient_export_data);
    } finally {
        await portal.shutdown();
    }
}

test('Check advice page', async t => {
    await load_patient_168_data();

    let url = `${BASE_URL}/static/advice.html?id=168`;
    let window1 = await t.openWindow(url);

    let selector = Selector('body');

    // initial check that patient data is rendered
    await t.expect(selector.withText('Methocarbamol').exists).ok();

    let med_advice = Selector('#med_advice');
    await t.expect(med_advice.withText('Stoppen').exists).ok();
    await t.expect(med_advice.withText('My comment').exists).ok();
    // TODO not sure that this test does what I want. I want to confirm that Methocarbamol does not appear > 1x.
    await t.expect(med_advice.withText(/(Methocarbamol.*){2}/).exists).notOk();
	
	let other_med_advice = Selector('#other_med_advice');
	await t.expect(other_med_advice.withText('Please continue').exists).ok();

    let nonmed_advice = Selector('#nonmed_advice');
    await t.expect(nonmed_advice.withText('Valpreventie bij ouderen').exists).ok();
	
	let last_changed = Selector('#last_changed');
    await t.expect(last_changed.withText('maandag 19 juli 2021 om 15:14.').exists).ok();

});
