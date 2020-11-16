jsonNonpolyp = d3.json('./data/non_polyp.json');
jsonPolyp = d3.json('./data/polyp.json');

jsonNonpolyp.then(nonpolypData => {
    headers = nonpolypData.headers;
    data = nonpolypData.data;

    data = data.slice(0, 20); // use only few data for quick debugging
    let tableNonpolyp = new TableNonpolyp(headers, data);
});

jsonPolyp.then(polypData => {
    headers = polypData.headers;
    data = polypData.data;

    data = data.slice(0, 20); // use only few data for quick debugging
    let tablePolyp = new TablePolyp(headers, data);
});


jsonCombinedQC = d3.json('./data/combined_qc.json').then(qcData => {
    headers = qcData.headers;
    console.log(headers);
    data = qcData.data;
    
    data = data.slice(0, 3); // use only few data for quick debugging
    for (let d of data) {
        console.log("==============================");
        for (let header of headers) {
            if (header == "samples") {
                console.log("    " + header + ":" + d[header].length + " samples");
            } else {
                console.log("    " + header + ":" + d[header]);
            }
        }
    }
})


jsonQcDensity = d3.json('./data/density_qc.json').then(qcdensityData => {
    qcdensityPlot = new QcDensityPlot(qcdensityData);
})