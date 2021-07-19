let params = new URLSearchParams(window.location.search)
let id = params.get('id');
let template = '<%= JSON.stringify(patient_json) %>';

window.addEventListener('load', () => {
    fetch(`../advice?id=${id}`).then(async res => {
        let patient_json = await res.json();
//		let med_advice = createMedAdviceHTML(patient_json["patient_advice"][0]["json_advice"]);
//		document.getElementById("med_advice").innerHTML = med_advice;
        html = ejs.render(template, { patient_json: patient_json });
        document.getElementById("main-content").innerHTML = html;
        if (window.readyForTesting !== undefined) {
            window.readyForTesting();
        }
    }).catch(err => { console.log(err) } );
});

function createMedAdviceHTML(json_advice){
	let med_advice = "";
/*	for (let i = 0; i < json_advice.length; ++i ) { 
		if(json_advice[i]["ATC_code"].match(/[A-Z][0-9].+/)){
			med_advice += "<div id=\"div_med_name_" + json_advice[i]["ATC_code"] 
				+"\" class = \"med_name\">" 
				+json_advice[i]["medcat_name"]
				+"</div>\n<div class=\"med_advice\">"
				+json_advice[i]["advice"] // TODO parse the markdown
				+"\n</div>\n"
		}
	}
*/	if(med_advice == ""){med_advice ="Geen"}
	
	return med_advice;

}
