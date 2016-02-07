/**
 * libjass-demo-react
 *
 * https://github.com/Arnavion/libjass-demo-react
 *
 * Copyright 2016 Arnav Singh
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require("path");
var webpack = require("webpack");

module.exports = {
	entry: "./index.jsx",
	output: { path: __dirname, filename: "index.js" },
	module: {
		loaders: [{
			test: /\.jsx?$/,
			loader: "babel-loader",
			exclude: /node_modules/,
			query: {
				compact: false,
				presets: [
					"es2015",
					"react"
				]
			}
		}, {
			test: /\.css$/,
			loader: "style-loader!css-loader"
		}]
	},
	resolve: {
		alias: {
			"libjass.css": path.resolve(require.resolve("libjass"), "..", "libjass.css")
		}
	},
};
