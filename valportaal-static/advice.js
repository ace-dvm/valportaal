let params = new URLSearchParams(window.location.search)
let id = params.get('id');
let template = '<%= JSON.stringify(patient_json) %>';
let md = new showdown.Converter();

window.addEventListener('load', () => {
    fetch(`../advice?id=${id}`).then(async res => {
        let patient_json = await res.json();
		let med_advice = "Geen";
		if(patient_json["patient_advice"] != undefined && Object.keys(patient_json["patient_advice"]).length > 0){
			med_advice = createMedAdviceHTML(patient_json["patient_advice"][0]["json_advice"]);
		}
        document.getElementById("med_advice").innerHTML = med_advice;
        html = ejs.render(template, {
            patient_json: patient_json
        });
        document.getElementById("main-content").innerHTML = html;
        if (window.readyForTesting !== undefined) {
            window.readyForTesting();
        }
    }).catch(err => {
        console.log(err)
    });
});

//TODO this function is tested in the testcafe test, but should probably have a unit test too. advice.test.js doesn't exist yet.
function createMedAdviceHTML(json_advice) {
    let med_advice = "";
        for (let i = 0; i < json_advice.length; ++i ) {
            if(json_advice[i]["ATC_code"].match(/[A-Z][0-9].+/)){
				let advice_text = formatAdvice(json_advice[i]["advice"], json_advice[i]["freetext"]);
                med_advice += "<div id=\"div_med_name_" + json_advice[i]["ATC_code"]
                    +"\" class = \"med_name\">"
                    +json_advice[i]["medcat_name"]
                    +"</div>\n<div class=\"med_advice\">"
                    +advice_text
                    +"\n</div>\n"
            }
        }
    if (med_advice == "") {
        med_advice = "Geen"
    }
    return med_advice;
}

function formatAdvice(advice_text, freetext){
	if(freetext == null){
		freetext = "";
	}
	let formatted_advice = md.makeHtml(advice_text);
	formatted_advice = formatted_advice.replace("<p>", "");
	formatted_advice = formatted_advice.replace("</p>", "<br><br>");
	let regex = /(\{\{free text.*\}\})/;
	formatted_advice = formatted_advice.replace(regex, freetext);
	console.log(formatted_advice);
	return formatted_advice;
}