let params = new URLSearchParams(window.location.search)
let id = params.get('id');
let template = '<%= JSON.stringify(patient_json) %>';

window.addEventListener('load', () => {
    fetch(`../advice?id=${id}`).then(async res => {
        let patient_json = await res.json();
        html = ejs.render(template, { patient_json: patient_json });
        document.getElementById("main-content").innerHTML = html;
        if (window.readyForTesting !== undefined) {
            window.readyForTesting();
        }
    }).catch(err => { console.log(err) } );
});
