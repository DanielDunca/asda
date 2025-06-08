# Interactive CS Map

This project provides a minimal interactive concept map for major Computer Science areas. Bubbles are generated from `cs_map.json` and can be explored via pan and zoom.

## Running

1. Run `node generate_cs_map.js` to fetch data from Wikipedia and build `cs_map.json`. (Requires internet access.)
2. Open `index.html` in a browser to explore the map.

## Extending the Data

Edit `generate_cs_map.js` to add more areas, notes or venues. Re-run the script to update `cs_map.json`.
