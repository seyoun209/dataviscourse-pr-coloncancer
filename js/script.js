jsonNonpolyp = d3.json('./data/non_polyp.json');
jsonPolyp = d3.json('./data/polyp.json');

jsonNonpolyp.then(nonpolypData => {
    let headers = [];
    let headersToDisplay = {"kindred": "Kinder ID", "subjectid": "Subject ID", "sex": "Sex", "age_at_clinic_visit": "Age", "bmi": "BMI", "smoke":"Smoke", "alcohol":"Alcohol", "exercise":"Exercise", "nsaid": "NASID", "hrt": "HRT"}
    for(let h of nonpolypData.headers) {
        if (h in headersToDisplay) {
            headers.push(headersToDisplay[h]);
        }
    }
    let data = nonpolypData.data.map(function(d) {
        for (let key in headersToDisplay) {
            if (d[key] != null && isNaN(d[key])) {
                if (d[key].toLowerCase() === "no") {
                    d[key] = 0;
                } 
            }
        }
        
        return {"kindred": d.kindred, "subjectid": d.subjectid, "sex": d.sex, "age": d.age_at_clinic_visit, "bmi": d.bmi, "smoke": d.smoke, "alcohol":d.alcohol, "exercise": d.exercise, "nsaid": d.nsaid, "hrt": d.hrt, "hidden": false};
    });

    console.log(headers)
    
    // data = data.slice(0, 20); // use only few data for quick debugging
    let tableNonpolyp = new TableNonpolyp(headers, data);

    jsonQcDensity = d3.json('./data/density_qc.json').then(qcdensityData => {
        qcdensityPlot = new QcDensityPlot(qcdensityData, tableNonpolyp);
    })
    
});
jsonPolyp.then(polypData => {
    let headers = [];

    let headersToDisplay = {"kindred": "Kinder ID", "subjectid": "Subject ID", "site": "Site", "polyptype": "Type", "polypsize": "Size"}
    for (let h of polypData.headers) {
        if (h in headersToDisplay) {
            headers.push(headersToDisplay[h]);
        }
    }
    let data = polypData.data.map(function (d, i) {
        return {"kindred": d.kindred, "subjectid": d.subjectid, "site": d.site, "polytype": d.polyptype, "polypsize": d.polypsize, "selected": false, "index": i};
    });

    // data = data.slice(0, 20); // use only few data for quick debugging
    let tablePolyp = new TablePolyp(headers, data);
});

jsonCombinedQC = d3.json('./data/combined_qc.json').then(qcData => {
    headers = qcData.headers;
    console.log(headers);
    data = qcData.data;
    
    // data = data.slice(0, 10); // use only few data for quick debugging
    // for (let d of data) {
    //     console.log("==============================");
    //     for (let header of headers) {
    //         if (header == "samples") {
    //             console.log("    " + header + ":" + d[header].length + " samples");
    //         } else {
    //             console.log("    " + header + ":" + d[header]);
    //         }
    //     }
    // }
    
    let combinedQc = new CombinedQcPlot(data);
})