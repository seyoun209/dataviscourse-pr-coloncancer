function initQcDensityPlot(tableNonpolyp, combinedQcPlot) {
    jsonQcDensity = d3.json('./data/density_qc.json').then(qcdensityData => {
        qcdensityPlot = new QcDensityPlot(qcdensityData, tableNonpolyp, combinedQcPlot);
        tableNonpolyp.setCombinedQcPlot(combinedQcPlot);
    });
}

jsonNonpolyp = d3.json('./data/non_polyp.json');
jsonPolyp = d3.json('./data/polyp_v2.json');
jsonCombinedQc = d3.json("./data/combined_qc.json");

jsonCombinedQc.then(qcData => {
    headers = qcData.headers;
    data = qcData.data;
    let subjectids = []
    for (let row of data) {
        for (let sample of row.samples) {
            let patient_id = sample.patent_id;
            if (subjectids.includes(patient_id) == false) {
                subjectids.push(patient_id);
            }
        }
    }
    jsonNonpolyp.then(nonpolypData => {
        let headers1 = [];
        let headersToDisplay = {"kindred": "Kinder ID", "subjectid": "Subject ID", "sex": "Sex", "age_at_clinic_visit": "Age", "bmi": "BMI", "smoke":"Smoke", "alcohol":"Alcohol", "exercise":"Exercise", "nsaid": "NASID", "hrt": "HRT"}
        for(let h of nonpolypData.headers) {
            if (h in headersToDisplay) {
                headers1.push(headersToDisplay[h]);
            }
        }
        let dataUnfiltered = nonpolypData.data.map(function(d) {
            for (let key in headersToDisplay) {
                if (d[key] != null && isNaN(d[key])) {
                    if (d[key].toLowerCase() === "no") {
                        d[key] = 0;
                    } 
                }
            }
            return {"kindred": d.kindred, "subjectid": d.s1_labid_crcid, "sex": d.sex, "age": d.age_at_clinic_visit, "bmi": d.bmi, "smoke": d.smoke, "alcohol":d.alcohol, "exercise": d.exercise, "nsaid": d.nsaid, "hrt": d.hrt, "hidden": false};
        });
        let dataFiltered = [];
        for (let d of dataUnfiltered) {
            if (subjectids.includes(""+d.subjectid)) {
                dataFiltered.push(d);
            }
        }

        let tableNonpolyp = new TableNonpolyp(headers1, dataFiltered);

        let combinedQc = new CombinedQcPlot(data);
        initQcDensityPlot(tableNonpolyp, combinedQc);
    });
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
        return {"kindred": d.kindred, "subjectid": d.s1_LabID_CRCid, "site": d.site, "polytype": d.polyptype, "polypsize": d.polypsize, "selected": false, "index": i};
    });

    // data = data.slice(0, 20); // use only few data for quick debugging
    let tablePolyp = new TablePolyp(headers, data);
});
