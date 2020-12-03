## Utah Population-based Genetic and Clinical Feature in Colorectal Cancer 
### [Seyoun Byun](https://www.linkedin.com/in/seyoun-b-860a4380/) (u0693520), [Hyojoon Park](https://hjoonpark.github.io/) (u1266489)

### Links
1. [Project website](https://seyoun209.github.io/dataviscourse-pr-coloncancer/)
2. [Video](https://youtu.be/PkfstrFtwyQ)
---

### Dataset and visualization
Two views `Genetic & Multivariate`(index.html) and `Polyp`(polyps.html) are used, where the first view visualizes:

1. Table 1: visualizes Kinder ID, Subject ID, Sex, BMI, Age, Smoke, Alcohol, NASID, HRT, and Exercise
2. Density plot: visualizes respective the polygenic risk scores (x-axis) and the respective frequency of subjects (y-axis).
3. Heatmap plot: visualizes the individual information of the SNP (genetic).

and the second view visualizes:

1. Table 2: visualizes Kinder ID, Subject ID, Site, Type, and Size,
2. Polyp image: visualizes a colon on which polyps of each subject are rendered with respective size, type, and location.

### Code organization

Two `.js` files are used to 1. load and 2. visualize the data.

1. `dataloader.js`: parses four json files and initializes four classes to visualize each of the json files.
    - non_polyp.json: for Table 1 (`class TableNonpolyp`)
    - density_qc.json: for Density plot (`class QcDensityPlot`)
    - combined_qc.json: for Heatmap plot (`class CombinedQcPlot`)
    - polyp_v2.json: for Table 2 (`class TablePolyp`)

2. `visualizer.js`: takes the parsed json files as inputs from `dataloader.js` and renders the corresponding tables and plots. This file contains the definitions of the four classes: `class TableNonpolyp`, `class QcDensityPlot`, `class CombinedQcPlot`, and `class TablePolyp`.

Lastly, `styles.css` contains the style properties.

For more details, please refer to the [project website](https://seyoun209.github.io/dataviscourse-pr-coloncancer/).