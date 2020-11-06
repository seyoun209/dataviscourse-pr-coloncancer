
class TableNonpolyp {
    constructor(headers, data) {
        this.name = "TableNonpolyp";

        // extract headers for table
        this.headerData = []
        for (const h of headers) {
            this.headerData.push({"sorted": false, "ascending": false, "key": h})
        }

        // extract data for table
        this.tableData = data;
        console.log(this.name + " init: " + this.tableData.length + " data.");

        // draw table
        this.updateHeaders();
        this.drawTable();
    }

    drawTable() {
        let rowSelection = d3.select('#nonpolypTableBody').selectAll('tr').data(this.tableData).join('tr');
        rowSelection.selectAll('td').data(d => Object.values(d)).enter().append('td').text(function(d, i){
            return d;
        }); 
        
    }
    updateHeaders() {
        let headerTds = d3.select('#nonpolypTableHead').selectAll('tr').data(this.headerData).join('td').text(d => d.key);
    }
}

class TablePolyp {
    constructor(headers, data) {
        this.name = "TablePolyp";

        // extract headers for table
        this.headerData = []
        for (const h of headers) {
            this.headerData.push({"sorted": false, "ascending": false, "key": h})
        }
        
        // extract data for table
        this.tableData = data;

        console.log(this.name + " init: " + this.tableData.length + " data.");

        // draw table
        this.updateHeaders();
        this.drawTable();
    }

    drawTable() {
        let rowSelection = d3.select('#polypTableBody').selectAll('tr').data(this.tableData).join('tr');
        rowSelection.selectAll('td').data(d => Object.values(d)).enter().append('td').text(function(d, i){
            return d;
        }); 
    }
    
    updateHeaders() {
        let headerTds = d3.select('#polypTableHead').selectAll('tr').data(this.headerData).join('td').text(d => d.key);
    }
}
