var selectedKinderids = [];
var selectedPolypIndex = -1;
var selectedSubjectIds = [];

class TableNonpolyp {
    constructor(headers, data) {
        this.name = "TableNonpolyp";
        this.combinedQcPlot = null;

        this.tableRowHeight = 20;
        this.sexSqrSize = 15;

        // for range
        this.x1 = 20;
        this.x2 = 80;
        this.y1 = 40;
        this.y2 = 100;
        
        // extract headers for table
        this.headerData = [];
        for (const h of headers) {
            this.headerData.push({"sorted": false, "ascending": false, "key": h});
        }
        // extract data for table
        this.tableData = data;
        console.log(this.name + " init: " + this.tableData.length + " data.");

        // find min/max values of data
        this.minmaxs = {"bmi": [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], 
                        "age": [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], 
                        "smoke": [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], 
                        "alcohol": [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], 
                        "nsaid": [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], 
                        "hrt": [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], 
                        "exercise": [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]};
        this.means = {"bmi": 0, "age": 0, "smoke": 0, "alcohol": 0, "nsaid": 0, "hrt": 0, "exercise": 0};
        this.N = {"bmi": 0, "age": 0, "smoke": 0, "alcohol": 0, "nsaid": 0, "hrt": 0, "exercise": 0};

        for (let d of this.tableData) {
            for (let k in this.minmaxs) {
                let val = d[k];
                if(isNaN(val) == false && val != null) {
                    if(val < this.minmaxs[k][0]) {
                        this.minmaxs[k][0] = val;
                    } 
                    if(val > this.minmaxs[k][1]) {
                        this.minmaxs[k][1] = val;
                    }
                    this.means[k] += val;
                    this.N[k] += 1;
                }
            }
        }
        for (let k in this.means) {
            if (this.N[k] >= 1) {
                this.means[k] /= this.N[k];
            }
        }
        
        // tooptip popup
        this.tooltipW = 90;
        this.tooltipH = 15;
        this.tooltip = d3.select(".nonpolyp-tooltip").style("width", this.tooltipW+"px").style("height", this.tooltipH+"px");

        // draw table
        this.initHeaders();
        this.updateHeaders();
        this.attachSortHandlers();
        // this.drawTable();
    }

    drawTable() {
        let that = this;
        let tableData = this.tableData;
        d3.select('#table1 tbody').selectAll("tr").data(tableData).join('tr');

        let keyOrder = ["kindred", "subjectid", "sex", "bmi", "age", "smoke", "alcohol", "nsaid", "hrt", "exercise"];

        tableData.forEach(function(d, i) {
            if (!d['hidden']) {
                let trow = d3.select('#table1 tbody').append("tr").attr("id", i);
                for (let key of keyOrder) {
                    let val = d[key];
                    
                    if (key == "sex") {
                        let className = "";
                        if (val == "M") {
                            className = "male";
                        } else if(val == "F") {
                            className = "female";
                        }
                        let row = trow.append("td").append("svg").attr("width", "100%").attr("height", that.tableRowHeight)
                        let rect = row.append("rect").attr("width", that.sexSqrSize).attr("height", that.sexSqrSize).attr("x", 55-that.sexSqrSize/2 + "%").attr("y", "25%").classed(className, true);
                        rect.on("mouseover", function(d) {
                            let boundingRect = this.parentNode.parentNode.getBoundingClientRect();
                            let x = boundingRect.x + window.scrollX;
                            let y = boundingRect.y + window.scrollY;
                            that.tooltip.html(className).style("left", x +that.tooltipW/2 + "px").style("top", y - that.tooltipH - 5 + "px").transition().duration(200).style("opacity", .9);
                        })
                        .on("mouseout", function(d){
                            that.tooltip.transition().duration(200).style("opacity", "0")
                        })
                    } else if(key != "kindred" && key != "subjectid"){
                        if (isNaN(d[key]) == false && d[key] != null && d[key] != "") {
                            that.updateRangedRow(trow, key, d[key]);
                        } else {
                            if (d[key] === "no") {
                                trow.append("td").text("None");
                            } else {
                                trow.append("td").text("-");
                            }
                        }
                    } else {
                        // kindred, subjectid
                        if(key == "kindred") {
                            trow.append("td").classed("K"+d[key], true).text(d[key]);
                        } else {
                            trow.append("td").text(d[key]);
                        }
                    }
                }
                trow.on("click", function(d, i) {
                    let rowIndex = this.id;
                    let selectedSubjectId = that.tableData[rowIndex].subjectid;
                    let kid = that.tableData[rowIndex].kindred;
                    let classkid = "K" + kid;

                    let selected = d3.select(this);
                    if (selected.classed(classkid)) {
                        selected.classed(classkid, false);
                        let existIndex = selectedSubjectIds.indexOf(""+selectedSubjectId);
                        if (existIndex > -1) {
                            selectedSubjectIds.splice(existIndex, 1);
                        }
                    } else {
                        selected.classed(classkid, true);
                        if (selectedSubjectIds.includes(""+selectedSubjectId) == false) {
                            selectedSubjectIds.push(""+selectedSubjectId);
                        }
                    }
                    that.combinedQcPlot.drawSquares();
                })
                trow.attr("class", function(d) {
                    let rowIndex = this.id;
                    let selectedSubjectId = that.tableData[rowIndex].subjectid;
                    let kid = that.tableData[rowIndex].kindred;
                    let classkid = "K" + kid;

                    let selected = d3.select(this);
                    if (selectedSubjectIds.includes(""+selectedSubjectId) == false) {
                        return "";
                    } else {
                        return classkid;
                    }
                })
            }
        });
    }
    setCombinedQcPlot(combinedQcPlot) {
        this.combinedQcPlot = combinedQcPlot;
        this.drawTable();
    }
    updateRangedRow(row, key, val) {
        let that = this;
        let min = this.minmaxs[key][0];
        let max = this.minmaxs[key][1];
        let v = (val-min) / (max-min) * 100.0;
        if (isNaN(v)) {
            v = val;
        }
        v = v * (this.x2-this.x1)/100 + this.x1;
        let svg = row.append("td").append("svg").attr("height", this.tableRowHeight).attr("width", "100%");
        let rect = svg.append("rect").attr("x", this.x1 + "%").attr("y", this.y1 + "%").attr("width", "60%").attr('height', this.y2-this.y1 + "%").classed("header-range", true);
        svg.append("line").attr("x1", this.x1 + "%").attr("x2", this.x1 + "%").attr("y1", this.y1 + "%").attr("y2", this.y2 + "%").attr("stroke", "black").attr("stroke-width", "1");
        svg.append("line").attr("x1", this.x2 + "%").attr("x2", this.x2 + "%").attr("y1", this.y1 + "%").attr("y2", this.y2 + "%").attr("stroke", "black").attr("stroke-width", "1");
        svg.append("line").attr("x1", v + "%").attr("x2", v + "%").attr("y1", this.y1 + "%").attr("y2", this.y2 + "%").attr("stroke", "red").attr("stroke-width", "4");

        rect.on("mouseover", function(d) {
            let boundingRect = this.parentNode.parentNode.getBoundingClientRect();
            let x = boundingRect.x + window.scrollX;
            let y = boundingRect.y + window.scrollY;
            that.tooltip.html(val.toFixed(2)).style("left", x + v + "px").style("top", y - that.tooltipH - 3 + "px").transition().duration(100).style("opacity", .9);
        })
        .on("mouseout", function(d){
            that.tooltip.transition().duration(100).style("opacity", "0");
        })
    }
    
    drawHeaderTick(selectId, key) {
        let that = this;
        let mean = this.means[key];
        let min = this.minmaxs[key][0];
        let max = this.minmaxs[key][1];
        let meanTick = (mean-min) / (max-min) * 100;
        
        if (isNaN(meanTick)) {
            meanTick = 0;
        }
        let y1 = this.y1 + 20;
        let y2 = this.y2;
        meanTick = meanTick * (this.x2-this.x1)/100 + this.x1;
        let rect = d3.select("#" + selectId).append("rect").attr("x", this.x1 + "%").attr("y", y1 + "%").attr("width", this.x2 - this.x1 + "%").attr('height', y2 - y1 + "%").classed("header-range", true);
        d3.select("#" + selectId).append("line").attr("x1", this.x1 + "%").attr("x2", this.x1 + "%").attr("y1", y1 + "%").attr("y2", y2 + "%").attr("stroke", "black").attr("stroke-width", "1");
        d3.select("#" + selectId).append("line").attr("x1", this.x2 + "%").attr("x2", this.x2 + "%").attr("y1", y1 + "%").attr("y2", y2 + "%").attr("stroke", "black").attr("stroke-width", "1");
        d3.select("#" + selectId).append("line").attr("x1", meanTick + "%").attr("x2", meanTick + "%").attr("y1", y1 + "%").attr("y2", y2 + "%").attr("stroke", "black").attr("stroke-width", "1");
        d3.select("#" + selectId).append("text").text(min.toFixed(2)).attr("x", this.x1 + "%").attr("y", y1 - 20 + "%").attr("text-anchor", "middle");
        d3.select("#" + selectId).append("text").text(max.toFixed(2)).attr("x", this.x2 + "%").attr("y", y1 - 20 + "%").attr("text-anchor", "middle");
        rect.on("mouseover", function(d) {
            let boundingRect = this.parentNode.parentNode.getBoundingClientRect();
            let x = boundingRect.x + window.scrollX;
            let y = boundingRect.y + window.scrollY;
            that.tooltip.html("Mean: " + mean.toFixed(2)).style("left", x + mean-min + "px").style("top", y - that.tooltipH / 2 + "px").transition().duration(200).style("opacity", .9);
        })
        .on("mouseout", function(d){
            that.tooltip.transition().duration(200).style("opacity", "0")
        })
        // d3.select("#" + selectId).append("text").text(mean.toFixed(1)).attr("x", meanTick + "%").attr("y", y1 - 20 + "%").attr("text-anchor", "middle");
    }

    attachSortHandlers() 
    {
        let keyMap = {"BMI": "bmi", "Age": "age", "Smoke":"smoke", "Alcohol":"alcohol", "NASID": "nsaid", "HRT":"hrt", "Exercise":"exercise"};

        let that = this;
        
        let header = d3.select("#table1 tr:nth-child(1)").selectAll("th").data(this.headerData);
        header.on("click", (m, d)=> {
            let clicked_key = d['key']
            this.headerData.forEach(x => {
                if(clicked_key === x['key']) {
                    if(x['sorted']) {
                        x['ascending'] = !x['ascending'];
                    } else {
                        x['sorted'] = true;
                        x['ascending'] = true;
                    }
                } else {
                    x['sorted'] = false;
                }
            });
            
            let key = keyMap[d['key']];

            that.tableData.sort(function(a, b){ 
                if (d['key'] === 'Kinder ID') {
                    if(a['kindred'] > b['kindred']) {
                        return d['ascending'] === true ? 1 : -1;
                    } else {
                        return d['ascending'] === true ? -1 : 1;
                    }
                } else if(d['key'] === 'Subject ID') {
                    if(a['subjectid'] > b['subjectid']) {
                        return d['ascending'] === true ? 1 : -1;
                    } else {
                        return d['ascending'] === true ? -1 : 1;
                    }
                } else if(d['key'] === 'Sex') {
                    if(a['sex'] < b['sex']) {
                        return d['ascending'] === true ? 1 : -1;
                    } else {
                        return d['ascending'] === true ? -1 : 1;
                    }
                } else {
                    if(a[key] < b[key]) {
                        return d['ascending'] === true ? 1 : -1;
                    } else {
                        return d['ascending'] === true ? -1 : 1;
                    }
                }
            });
            that.updateHeaders();
            that.drawTable();
        });
    }

    initHeaders() {
        // tooptip popup
        let tooltipW = 250;
        let tooltipH = 120;
        let tooltip = d3.select(".description-tooltip").style("width", tooltipW+"px").style("height", tooltipH+"px");

        let that = this;
        let headerTds = d3.select('#table1 thead tr:nth-child(1)').selectAll('th').data(this.headerData).enter().append('th').classed("table-header sortable", true).text(d => d.key)
        .attr("rowspan", function(d){
            if(d.key == 'Kinder ID' || d.key == 'Subject ID') {
                return 2;
            } else {
                return 1;
            }
        }).attr("width", function(d) {
            if(d.key == 'Kinder ID' || d.key == 'Subject ID') {
                return "80px";
            } else {
                return "*";
            }
        })
        .attr("id", function(d, i) {
            return i;
        });
        headerTds.append("i").classed("fas no-display", true)

        headerTds.on("mousemove", function(d) {
            let x = d.x + window.scrollX;
            let y = d.y + window.scrollY;
            
            let selectedCol = this.id;
            let header = that.headerData[selectedCol].key;
            let title = header;
            let body  = "";
            if (header === "Kinder ID") {
                body = "Family ID";
            } else if (header === "Subject ID") {
                body = "Individual subject";
            } else if (header === "Sex") {
                body = "Male and female";
            } else if (header === "BMI") {
                body = "Body Mass Index is a complex phenotype that may interact with genetic variants to influence colorectal cancer risk.";
            } else if (header === "Age") {
            } else if (header === "Smoke") {
                body = "Cigarette smoking is an established risk factor for colorectal cancer.";
            } else if (header === "Alcohol") {
            } else if (header === "NASID") {
                body = "Non-steroidal anti-inflammatory drugs- Men who used aspirin were also more likely to use the NASIDs, and the Aspirin/NSAIDs would prevent colorectal cancer and cardiovascular disease.";
            } else if (header === "HRT") {
                body = "Hormone Replacement Therapy- Epidemiologic studies evaluating hormone therapy use and colorectal cancer risk by the status of cell-cycle regulators are lacking.";
            } else if (header === "Exercise") {
                body = "Exercise will decrease the mortality and risk of recurrence for colorectal cancer.";
            }
            tooltip.html("<b>[" + title + "]</b><br>" + body).style("left", x - tooltipW/2 + "px").style("top", y + tooltipH/2  - 20 + "px").transition().duration(100).style("opacity", .9);
        }).on("mouseout", function(d) {
            tooltip.transition().duration(100).style("opacity", "0")
        });
        
        

        let placeholders = [];
        for (let i in this.headerData) {
            if ( i > 1) {
                placeholders.push(this.headerData[i].key);
            }
        }
        let rectWidth = 50.0;
        headerTds = d3.select('#table1 thead tr:nth-child(2)').selectAll('td').data(placeholders).enter().append('td').classed("table-header2", true)
        .append("svg").attr("width", "100%").attr("height", that.tableRowHeight*1.5).attr("id", d=>d);
        // .append("rect").attr("width", rectWidth).attr('transform', "translate("+rectWidth*0.5+", 0)").attr('height', "100%").attr("fill", "red");

        // sex
        let mX = 40-that.sexSqrSize/2;
        let mg = d3.select("#Sex").append("g").attr("width", "50%")
        mg.append("rect").attr("x", mX + "%").attr("y", "50%").attr("width", that.sexSqrSize).attr('height', that.sexSqrSize).classed("male", true);
        mg.append("text").text("M").attr("x", mX + 3 + "%").attr("y", "35%");

        let fX = 60;
        let fg = d3.select("#Sex").append("g").attr("width", "50%")
        fg.append("rect").attr("x", fX + "%").attr("y", "50%").attr("width", that.sexSqrSize).attr('height', that.sexSqrSize).classed("female", true);
        fg.append("text").text("F").attr("x", fX + 3  + "%").attr("y", "35%");

        // others
        this.drawHeaderTick("BMI", "bmi");
        this.drawHeaderTick("Age", "age");
        this.drawHeaderTick("Smoke", "smoke");
        this.drawHeaderTick("Alcohol", "alcohol");
        this.drawHeaderTick("NASID", "nsaid");
        this.drawHeaderTick("HRT", "hrt");
        this.drawHeaderTick("Exercise", "exercise");
    }

    updateHeaders() {
        let header = d3.select('#table1 tr:nth-child(1)').selectAll("th").data(this.headerData);
        header.classed('sorting', d=>{
            return d['sorted'];
        })
        let icon = d3.select('#table1 tr:nth-child(1)').selectAll('i').data(this.headerData);
        icon.classed("fa-sort-up", function(d){ 
            return d['ascending'];
        })
        icon.classed("fa-sort-down", function(d){ 
            return !d['ascending'];
        })
        icon.classed('no-display', function(d){
            return !d['sorted'];
        })
    }

    filterByKinderid() {
        let that = this;
        let nFiltered = 0;
        Object.keys(this.tableData).reduce(function (filtered_, index) {
            if (selectedKinderids.length > 0) {
                if (selectedKinderids.includes("K"+that.tableData[index]['kindred'])) {
                    that.tableData[index]['hidden'] = false;
                } else {
                    that.tableData[index]['hidden'] = true;
                }
            } else {
                that.tableData[index]['hidden'] = false;
            }
            return filtered_;
        }, {});
        this.drawTable();
    }
}

class TablePolyp {
    constructor(headers, data) {
        this.name = "TablePolyp";
        this.polypPositions = {"right": [38 ,250], "left": [360, 250], 
            "transverse": [200, 150], "cecum": [73, 352], "sigmoid": [330, 360], "hepatic flexure": [48, 135], 'splenic flexure': [350, 135], "ileum": [195, 335], "anus": [198, 420]
        };
        
        let offsetY = 70;
        for (let k in  this.polypPositions) {
            this.polypPositions[k][1] -= offsetY;
        }
        this.polypPositions['ascending'] = this.polypPositions['right'];
        this.polypPositions['descending'] = this.polypPositions['left'];
        this.polypPositions["rectum"] = this.polypPositions['anus'];
        
        this.polypSizes = {"<5mm":5, "5-9mm":8, "10-19mm":11, "20-29mm":14, "30-39mm":17, ">39mm":20};
        this.polypTypes = ["Adenocarcinoma", "Hyperplastic", "Inflammatory", "Lymphoid Aggregate Formation", "Lymphoid Follicle", "Lymphoid Hyperplasia", "Unknown", "No tissue identified at pathology", "TubuloAdenocarcinoma"];
        this.cellWidths = {"Kinder ID": 240, "Subject ID": 240, "Site": 240, "Type": 240, "Size": 240}

        // tooptip popup
        this.tooltipW = 180;
        this.tooltipH = 100;
        this.tooltip = d3.select(".polyp-tooltip").style("width", this.tooltipW+"px").style("height", this.tooltipH+"px");

        // extract headers for table
        this.headerData = [];
        for (const h of headers) {
            this.headerData.push({"sorted": false, "ascending": false, "key": h});
        }
        
        // extract data for table
        this.tableData = data;

        console.log(this.name + " init: " + this.tableData.length + " data.");

        // draw table
        this.initHeaders();
        this.updateHeaders();
        this.attachSortHandlers();
        this.drawTable();
        this.drawInfoTables();
        this.drawColon();

    }
    initHeaders() {
        let that = this;
        let headerTds = d3.select('#polypTableHead tr').selectAll("th").data(this.headerData).enter().append('th').attr("width", d=>that.cellWidths[d.key] + "px").text(d => d.key).classed("table-header sortable", true).append("i").classed("fas no-display", true);;
    }
    
    updateHeaders() {
        let header = d3.select('#polypTableHead tr:nth-child(1)').selectAll("th").data(this.headerData);
        header.classed('sorting', d=>{
            return d['sorted'];
        })
        let icon = d3.select('#polypTableHead tr:nth-child(1)').selectAll('i').data(this.headerData);
        icon.classed("fa-sort-up", function(d){ 
            return d['ascending'];
        })
        icon.classed("fa-sort-down", function(d){ 
            return !d['ascending'];
        })
        icon.classed('no-display', function(d){
            return !d['sorted'];
        })
    }

    attachSortHandlers() 
    {
        let that = this;
        let keyMap = {"Kinder ID": "kindred", "Subject ID": "subjectid", "Site": "site", "Type": "polytype", "Size": "polypsize"};

        let header = d3.select("#polypTableHead tr:nth-child(1)").selectAll("th").data(this.headerData);
        header.on("click", (m, d)=> {
            let clicked_key = d['key']
            this.headerData.forEach(x => {
                if(clicked_key === x['key']) {
                    if(x['sorted']) {
                        x['ascending'] = !x['ascending'];
                    } else {
                        x['sorted'] = true;
                        x['ascending'] = true;
                    }
                } else {
                    x['sorted'] = false;
                }
            });
            
            let key = keyMap[d['key']];
            that.tableData = that.tableData.sort(function(a, b){ 
                if(a[key] < b[key]) {
                    return d['ascending'] === true ? 1 : -1;
                } else {
                    return d['ascending'] === true ? -1 : 1;
                }
            });
            that.updateHeaders();
            that.drawTable();

        });
    }

    drawTable() {
        let that = this;
        let rowSelection = d3.select('#polypTableBody').selectAll('tr').data(this.tableData).join('tr').attr("class", function(d, i){
            if (d.selected) {
                return "K" + d.kindred;
            } else {
                return "";
            }
        });
        rowSelection.selectAll('td').data(d=>Object.values(d)).join('td').attr("width", function(d, i) {
            let key = Object.keys(that.cellWidths)[i];
            if (key in that.cellWidths) {
                let width = that.cellWidths[key];
                return width + "px";
            } else {
                return "0";
            }
        }).text(function(d, i) {
            let key = Object.keys(that.cellWidths)[i];
            if (key in that.cellWidths) {
                return d;
            } else {
                return "";
            }
        }).attr("class", function(d, i) {
            let key = Object.keys(that.cellWidths)[i];
            if (key === "Kinder ID") {
                return "K" + d;
            } else {
                return "";
            }
        })
        .on("mouseover", function(d) {
            let selectedRow = this.parentNode.rowIndex;
            if(selectedRow == selectedPolypIndex) {

            } else {
                let selectedData = that.tableData[selectedRow];
                that.polypMouseOver(selectedRow, selectedData);
            }
        })
        .on("mouseout", function(d) {
            let unselectedRow = this.parentNode.rowIndex;
            if(unselectedRow == selectedPolypIndex) {

            } else {
                that.polypMouseOut(unselectedRow);
            }
        }).on("click", function(d, i) {
            for(let dd of that.tableData) {
                dd.selected = false;
            }
            if (selectedPolypIndex > -1) {
                that.polypMouseOut(selectedPolypIndex);
            }

            if(selectedPolypIndex == this.parentNode.rowIndex) {
                // unselect
                that.polypMouseOut(selectedPolypIndex);
                selectedPolypIndex = -1;
                that.drawTable();
            } else {
                // select
                selectedPolypIndex = this.parentNode.rowIndex;
                that.tableData[selectedPolypIndex].selected = true;
                let selectedData = that.tableData[selectedPolypIndex];
                that.polypMouseOut(selectedPolypIndex)
                that.polypMouseOver(selectedPolypIndex, selectedData)
                that.drawTable();
            }
        });
    }

    polypMouseOver(selectedRow, selectedPolyp) {
        let that = this;
        let polypSize = selectedPolyp["polypsize"].toLowerCase().trim();
        let site = selectedPolyp['site'].toLowerCase().trim();
        let type = selectedPolyp['polytype'].replace(/\s+/g, '-').toLowerCase().trim();
        let rectW = 80;
        let rectH = 20;

        if (site in this.polypPositions) {
            let pos = this.polypPositions[site];
            let radius = 5;
            if (polypSize !== "unknown") {
                radius = this.polypSizes[polypSize];
            }
            let x = pos[0];
            let y = pos[1];
            d3.select("#colon-interactive").append("circle").attr("cx", x + "px").attr("cy", y + "px").attr("r", radius + "px").attr("id", "polyp-" + selectedRow).attr("class", "polyp-circle " + type)
            .on("mouseover", function(d){
                let x = d.x + window.scrollX; 
                let y = d.y + window.scrollY;
                let kinderid = selectedPolyp["kindred"];
                let subjectid = selectedPolyp["subjectid"];
                let site = selectedPolyp["site"];
                let polytype = selectedPolyp["polytype"];
                let polypsize = selectedPolyp["polypsize"];
                that.tooltip.html("<b>Kinder ID:</b> " + kinderid + "<br><b>Subject ID:</b> " + subjectid + "<br><b>Site:</b> " + site + "<br><b>Type:</b> " + polytype + "<br><b>Size:</b> " + polypsize)
                .style("left", x - that.tooltipW/2 + "px").style("top", y + that.tooltipH/2  - 20 + "px").transition().duration(100).style("opacity", .9);
            })
            .on("mouseout", function(d){
                that.tooltip.transition().duration(100).style("opacity", 0);  
            })
            d3.select("#colon-interactive").append("rect").attr("x", x - rectW/2+ "px").attr("y", y - rectH - radius - 5 + "px").attr("opacity", 0.75).attr("fill", "white").attr("width", rectW).attr('height', rectH).attr("id", "polyp-" + selectedRow);
            d3.select("#colon-interactive").append("text").attr("x", x + "px").attr("y", y - radius - 10 + "px").text(polypSize).attr("text-anchor", "middle").attr("fill", "red").attr("font-weight", "bold").attr("id", "polyp-" + selectedRow);
        }
    }

    polypMouseOut(unselectedRow) {
        d3.selectAll("#polyp-" + unselectedRow).remove();
    }

    drawColon() {
        let w = 519;
        let h = 483;
        let imgContainer = d3.select('#colon-interactive');
        imgContainer.append("svg:image")
            .attr("width", "100%").attr("height", "90%").attr("id", "colon-image")
            .attr("x", "0%").attr("y", "5%")
            .attr("xlink:href", "./../assets/colon.png");
    }
    drawInfoTables() {
        // table to display polyp size info
        d3.select("#polyp-size-table tr:nth-child(2)").selectAll("td").data(Object.keys(this.polypSizes)).enter().append("td").text(d=>d);
        let circleSvg = d3.select("#polyp-size-table tr:nth-child(1)").selectAll("td").data(Object.values(this.polypSizes)).enter().append("td").append("svg").attr("width", "100%").attr('height', d=>2.*d + 10 + "px");
        circleSvg.append("circle").attr("cx", "50%").attr("cy", "50%").attr("r", d=>d + "px").classed("polyp-size-circle", true);

        // table to display polyp type info
        d3.select("#polyp-type-table tr:nth-child(2)").selectAll("td").data(this.polypTypes).enter().append("td").text(d=>d);
        circleSvg = d3.select("#polyp-type-table tr:nth-child(1)").selectAll("td").data(this.polypTypes).enter().append("td").append("svg").attr("width", "100%").attr('height', "40px");
        circleSvg.append("circle").attr("cx", "50%").attr("cy", "50%").attr("r", "14px").attr("class", function(d){ 
            let type = d.replace(/\s+/g, '-').toLowerCase().trim();
            return type;
        });
    }

    drawRangeTicks(selectId, minMaxMean) {
    }
}

class QcDensityPlot {
    constructor(dataArray, nonpolypTable, combinedQcPlot) {
        this.name = "QcDensityPlot";
        this.nonpolypTable = nonpolypTable;
        this.combinedQcPlot = combinedQcPlot;

        this.margin = { top: 20, right: 40, bottom: 35, left: 60 };
        this.width = 1400 - this.margin.left - this.margin.right;
        this.height = 300 - this.margin.top - this.margin.bottom;

        this.dataArray = dataArray;
        // pre-compute min, ax values across all data
        this.mins = {x: Infinity , y: Infinity };
        this.maxs = {x: -Infinity , y: -Infinity };
        for (let d of this.dataArray) {
            this.mins.x = Math.min(this.mins.x, d.x);
            this.mins.y = Math.min(this.mins.y, d.y);
            this.maxs.x = Math.max(this.maxs.x, d.x);
            this.maxs.y = Math.max(this.maxs.y, d.y);
        }

        // extract headers to generate toggle buttons
        this.kinderIds = [];
        for (let d of this.dataArray) {
            if (this.kinderIds.indexOf(d.key) === -1) {
                this.kinderIds.push(d.key);
            }
        }
        this.kinderIds.sort();
        this.initKinderidButtons();
        this.drawDensityPlot();
    }

    drawDensityPlot() {
        let plotSvg =d3.select('#qcdensity-plot')
            .append("div").style("display", "inline-block").style("vertical-align", "top")
            .append('svg').classed('plot-svg', true)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        let tooltipW2 = 250;
        let tooltipH2 = 100;
        let plotTooltip = d3.select(".plot-description-tooltip").style("width", tooltipW2 + "px").style("height", tooltipH2 + "px");
        plotSvg.on("mousemove", function(d) {
            let x = d.x + window.scrollX;
            let y = d.y + window.scrollY;
            
            plotTooltip.html("<b>[Density Plot]</b><br>X-axis is the polygenic Risk score of 30 SNPs. Y-axis is the frequency of subjects in each family.")
            .style("left", x - tooltipW2/2 + "px").style("top", y + tooltipH2/2  - 20 + "px")
            .transition().duration(100).style("opacity", .9);
        }).on("mouseout", function(d) {
            plotTooltip.transition().duration(100).style("opacity", "0")
        });


        this.svgGroup = d3.select('#qcdensity-plot').select('.plot-svg').append('g').classed('wrapper-group', true);
        
        this.svgGroup.append('g').attr('id', 'x-axis');
        this.svgGroup.append('g').attr('id', 'y-axis');

        this.currentKinderid = this.svgGroup.append("text")
            .attr("x", this.margin.left/2 + this.width/2)
            .attr("y", this.margin.top)
            .text("").attr("text-anchor", "middle").attr("alignment-baseline", "top");

        // *** Setting the scales for your x, y, and circle data ***
        // x axis
        this.xScale = d3.scaleLinear().domain([this.mins.x, this.maxs.x]).range([0, this.width]).nice();
        let xAxis = d3.axisBottom().scale(this.xScale);
        let xAxisBar = this.svgGroup.select("#x-axis");
        xAxisBar.exit().remove(); 
        let xAxisEnter = this.svgGroup.enter().append('g');
        xAxisBar = xAxisBar.merge(xAxisEnter);
        xAxisBar.call(xAxis).classed("axis", true).attr("transform", "translate(" + this.margin.left + ", " + this.height + ")");
        xAxisBar.selectAll(".tick").classed("axis-label", true);

        // y axis
        this.yScale = d3.scaleLinear().domain([this.mins.y, this.maxs.y]).range([this.height-this.margin.top, 0]).nice();
        let yAxis = d3.axisLeft().scale(this.yScale);
        let yAxisBar = this.svgGroup.select("#y-axis");
        yAxisBar.exit().remove();
        let yAxisEnter = this.svgGroup.enter().append('g');
        yAxisBar = yAxisBar.merge(yAxisEnter);
        yAxisBar.call(yAxis).classed("axis", true).attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")");
        yAxisBar.selectAll(".tick").classed("axis-label", true);

        // set axes labels
        this.svgGroup.append('text').attr('id', 'xText');
        this.svgGroup.append('text').attr('id', 'yText');
        
        let translateX = (0.5*this.width + this.margin.left) + "," + (this.margin.top + this.height + 25);
        let xBarLabel = this.svgGroup.select("#xText");
        xBarLabel.exit().remove();

        let xEnter = xBarLabel.enter().append('text');
        xBarLabel = xBarLabel.merge(xEnter);

        xBarLabel.datum("Polygenic Risk Score")
                .text(d => d)
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + translateX + ")")
                .classed('x-label', true);
                    
        let yBarLabel = this.svgGroup.select("#yText");

        let yEnter = yBarLabel.enter().append('text');
        yBarLabel = yBarLabel.merge(yEnter);

        yBarLabel.datum("Frequency of Subjects")
                .text(d => d)
                .attr("transform", "translate(20, "+ this.height/2 +") rotate(-90)")
                .classed('y-label', true)
                .style("text-anchor", "middle");
    }

    addDensityCircles(kid, data) {
        let that = this;
        
        let circlePlotEnter = this.svgGroup.append("g").classed(kid, true).selectAll('circle').data(data).enter().append('circle')
        .attr("cx", function (d) {
            return that.margin.left + that.xScale(d.x);
        })
        .attr("cy", this.height )
        .attr('r', 0).attr('class', d=>d.key).transition()
        .duration(300)
        .attr("cx", function (d) { return that.margin.left + that.xScale(d.x); } )
        .attr("cy", function (d) { return that.margin.top + that.yScale(d.y); } )
        .attr("r", 3);

        // circlePlot.transition().duration(300).attr('cy', this.height).remove();
    }
    
    removeDensityCircles(kid) {
        this.svgGroup.selectAll("." + kid).selectAll("circle").transition().duration(300).attr('cy', this.height).remove();
    }

    initKinderidButtons() {
        let that = this;
        let width = 1000;
        let height = 30;
        let margin = { top: 0, right: 20, bottom: 10, left: 20 };

        let buttonWidth = 80;
        let buttonHeight = 30;
        let buttonDiv = d3.select('#qcdensity-plot')
            .append('div').classed('kid-buttons-group', true).style("margin", "0 auto").style("text-align", "center")
            .attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("svg").attr("width", buttonWidth * this.kinderIds.length + "px").attr("height", height + margin.bottom + "px").style("margin", "0 auto").style("text-align", "center").append('g')
        
        let i = 0
        for (let kid of this.kinderIds) {
            buttonDiv.append("rect")
            .attr("class", "kid-button").attr("width", buttonWidth).attr("height", buttonHeight).attr("id", kid)
            .attr("x", function(d) {
                return i*buttonWidth + "px";
            })
            .attr("y", function(d){
                return "0px";
            }).on("click", function(d) {
                let kinderid = d.path[0].id;
                
                if (d3.select(this).classed(kinderid)) {
                    d3.select(this).classed(kinderid, false);
                    const index = selectedKinderids.indexOf(kinderid);
                    if (index > -1) {
                        selectedKinderids.splice(index, 1);
                    }
                    that.removeDensityCircles(kinderid);

                    d3.select('#text-'+kid).attr("class", "kid-button-text");
                } else{
                    d3.select(this).classed(kinderid, true);
                    selectedKinderids.push(kid);

                    let data = [];
                    for (let d of that.dataArray) {
                        if (d.key == kid) {
                            data.push(d);
                        }
                    }
                    that.addDensityCircles(kid, data);

                    d3.select('#text-'+kid).attr("class", "kid-button-text-selected");
                }
                that.currentKinderid.text(selectedKinderids.join(" | "))
                that.nonpolypTable.filterByKinderid();
            });

            buttonDiv.append("text").attr("id", "text-"+kid).attr("class", "kid-button-text").text(kid).attr("text-anchor", "middle").attr("alignment-baseline", "middle").attr("x", function(d) {
                return i*buttonWidth + buttonWidth/2 + "px";
            })
            .attr("y", function(d){
                return  buttonHeight/2 + "px";
            })
            
            i += 1;
        }
    }
}

class CombinedQcPlot {
    constructor(dataArray) {
        this.name = "CombinedQcPlot";
        this.dataArray = dataArray;

        // line
        this.x1 = 0;
        this.x2 = 400;
        this.y1 = 0;
        this.y2 = 200;

        this.rectSize = 8.75;
        this.margin = { top: 35, right: 10, bottom: 60, left: 25 };
        this.margin2 = {left: 50};
        this.width = this.rectSize*203;
        this.height = this.rectSize*30;
        this.infoBoxWidth = 180;
        this.initHeatmap();
        this.drawSquares();
    }
    initHeatmap() {
        let that = this;

        let plotSvg = d3.select("#combinedqc-plot")
            .append('svg').classed('plot-svg', true)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

            
        let tooltipW2 = 250;
        let tooltipH2 = 100;
        let plotTooltip = d3.select(".plot-description-tooltip").style("width", tooltipW2 + "px").style("height", tooltipH2 + "px");
        plotSvg.on("mousemove", function(d) {
            let x = d.x + window.scrollX;
            let y = d.y + window.scrollY;
            
            plotTooltip.html("<b>[Heatmap]</b><br>Heatmap of 30 SNP genotype data of 198 samples. 0 is Homozygous non-reference, 1 is heterozygous, and 2 is homozygous reference.")
            .style("left", x - tooltipW2/2 + "px").style("top", y + tooltipH2/2  - 20 + "px")
            .transition().duration(100).style("opacity", .9);
        }).on("mouseout", function(d) {
            plotTooltip.transition().duration(100).style("opacity", "0")
        });

        this.svgGroup = d3.select('#combinedqc-plot').select('.plot-svg').append('g').classed('wrapper-group', true);
    
        let xaxis = this.svgGroup.append('g').attr('id', 'x-axis')
        let yaxis = this.svgGroup.append('g').attr('id', 'y-axis');

        // xaxis.append("line").style("stroke", "black").style("stroke-width", "1px")
        //     .attr("x1", this.margin.left + this.margin2.left)
        //     .attr("y1", this.margin.top)
        //     .attr("x2", this.margin.left + this.margin2.left+this.width)
        //     .attr("y2", this.margin.top);
        // yaxis.append("line").style("stroke", "black").style("stroke-width", "1px")
        //     .attr("x1", this.margin.left + this.margin2.left)
        //     .attr("y1", this.margin.top)
        //     .attr("x2", this.margin.left + this.margin2.left)
        //     .attr("y2", this.margin.top + this.height);
        
        yaxis.selectAll("text").data(this.dataArray).join("text").text(d=>d.snp)
            .attr("text-anchor", "end")
            .attr("x", this.margin.left + this.margin2.left - 5)
            .attr("y", function(d, i) {
                return that.margin.top + (i+1)*that.rectSize;
            })
            .style("font-size", "12px");

        this.svgGroup.append('text').attr('id', 'xText').text("Subject IDs")
            .attr("x", this.margin.left + this.width/2)
            .attr("y", this.margin.top - 5)
            .attr("text-anchor", "middle");
            
        this.svgGroup.append('text').attr('id', 'yText').text("SNP IDs")
        .attr("x", this.margin.left - 10)
        .attr("y", this.margin.top - 5)
            .attr("text-anchor", "start");

        let infoboxHeight = 22;
        let infoGroup = d3.select('#combinedqc-plot').select('.plot-svg').append("g");
        infoGroup.append("rect")
            .attr("width", that.infoBoxWidth)
            .attr("height", infoboxHeight + "px")
            .attr("x", that.margin.left + that.width - that.infoBoxWidth - that.rectSize)
            .attr("y", that.margin.top - infoboxHeight - 5)
            .attr("fill", "white")
            .attr("stroke", "lightgray")
            .attr("stroke-width", "1px")
        
        infoGroup = d3.select('#combinedqc-plot').select('.plot-svg').append("g");
        let samples = [0, 1, 2]
        infoGroup.selectAll("rect").data(samples).enter().append("rect")
        .attr("width", this.rectSize*1.5).attr("height", this.rectSize*1.5)
        .attr("x", function(d) {
            return that.margin.left +that.infoBoxWidth / 15 + that.width - that.infoBoxWidth + that.infoBoxWidth / 3 * d - that.rectSize;
        })
        .attr("y", function(d) {
            return that.margin.top - infoboxHeight - 1.5;
        })
        .attr("class", d=>"qc-"+d);

        infoGroup.selectAll("text").data(samples).enter().append("text")
        .attr("x", function(d) {
            return that.margin.left + that.rectSize/2 + that.width - that.infoBoxWidth + that.infoBoxWidth / 3 * d + that.rectSize*2.5 - that.rectSize;
        })
        .attr("y", function(d) {
            return that.margin.top - infoboxHeight + 11;
        })
        .text(d=>d);
        
        infoGroup.append("text")
        .attr("x", that.margin.left + that.width - that.infoBoxWidth - that.rectSize*2)
        .attr("y", that.margin.top - 10)
        .text("SNP Genotype Data:")
        .attr("font-size", "16px")
        .attr("text-anchor", "end");
    }
    drawSquares() {
        let that = this;
        this.svgGroup.selectAll("g").data(this.dataArray).join("g").attr("id", function(d, i){
            return d.snp;
        });

        let nRow = 0;
        for(let d of this.dataArray) {
            let snp = d.snp;
            let dd = d.samples;
            that.svgGroup.selectAll("#" + snp).selectAll("rect").data(dd).join("rect").attr("width", that.rectSize).attr("height", that.rectSize).attr("x", function(d2, i) {
                return that.margin.left + that.margin2.left + i*that.rectSize;
            })
            .attr("y", function(d2, i){
                return that.margin.top + nRow*that.rectSize;
            })
            .attr("class", function(d2, i) {
                let patent_id = d2.patent_id;
                if (selectedSubjectIds.length > 0) {
                    if (selectedSubjectIds.includes(patent_id)) {
                        return "qc-"+d2.num_samples + " qc-selected";
                    }
                    return "qc-"+d2.num_samples + " qc-unselected";
                } else {
                    return "qc-"+d2.num_samples + " qc-selected";
                }
            })
            nRow += 1;
        }
    }
}
