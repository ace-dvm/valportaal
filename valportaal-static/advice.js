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
	let current_med_name = "";
	let counter = 0;
        for (let i = 0; i < json_advice.length; ++i ) {
            if(json_advice[i]["ATC_code"].match(/[A-Z][0-9].+/)){
				let advice_text = formatAdvice(json_advice[i]["advice"], json_advice[i]["freetext"]);
				advice_text = "<div  class=\"med_advice_text\"><ul>" +  advice_text + "</ul></div>";
				advice_text = advice_text.replace("<p>", "<li>");
				advice_text = advice_text.replace("</p>", "</li>");
				let med_name = json_advice[i]["medcat_name"];
				med_name = med_name.charAt(0).toUpperCase() + med_name.slice(1);
				let med_name_div = "";
				if(med_name !== current_med_name){
					current_med_name = med_name;
					med_name_div = "<div id=\"div_med_name_" + json_advice[i]["ATC_code"]
                    +"\" class = \"med_name\">"
                    +med_name
                    +"</div>\n";
				}
                med_advice += med_name_div + advice_text;
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
	let regex = /(\{\{free text.*\}\})/;
	formatted_advice = formatted_advice.replace(regex, freetext);
	return formatted_advice;
}