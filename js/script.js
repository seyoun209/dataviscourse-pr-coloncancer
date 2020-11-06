jsonNonpolyp = d3.json('./data/non_polyp.json');
jsonPolyp = d3.json('./data/polyp.json');

jsonNonpolyp.then(nonpolypData => {
    headers = nonpolypData.headers;
    data = nonpolypData.data;

    data = data.slice(0, 20); // use only 20 data for quick debugging
    let tableNonpolyp = new TableNonpolyp(headers, data);
});

jsonPolyp.then(polypData => {
    headers = polypData.headers;
    data = polypData.data;

    data = data.slice(0, 20); // use only 20 data for quick debugging
    let tablePolyp = new TablePolyp(headers, data);
});
