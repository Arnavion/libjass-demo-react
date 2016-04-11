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

var prod = process.argv[2] === "prod";

import { writeFile } from "fs";
import request from "request";
import { satisfies } from "semver";

const promises = [
	["babel-polyfill", "6.x"],
	["react", "15.x"],
	["react-redux", "4.x"],
	["redux", "3.x"]
].map(([name, requiredVersion]) => new Promise((resolve, reject) =>
		request(`https://api.cdnjs.com/libraries/${ name }`, (err, response, body) => {
		if (err) {
			reject(err);
			return;
		}

		if (response.statusCode !== 200) {
			reject(response.statusCode);
			return;
		}

		resolve(body);
	})).then(body => {
		const json = JSON.parse(body);

		for (const { version } of json.assets) {
			if (satisfies(version, requiredVersion)) {
				return version;
			}
		}

		throw new Error(`No version found for ${ name }:${ requiredVersion }.`);
	})
);

Promise.all(promises).then(([babel, react, reactRedux, redux]) => new Promise((resolve, reject) => {
	const xhtml =
`<?xml version="1.0" encoding="utf-8" ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
	<head>
		<title>libjass demo</title>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/${ babel }/polyfill${ prod ? ".min" : "" }.js" defer="defer" />
		<script src="https://cdnjs.cloudflare.com/ajax/libs/react/${ react }/react${ prod ? ".min" : "" }.js" defer="defer" />
		<script src="https://cdnjs.cloudflare.com/ajax/libs/react/${ react }/react-dom${ prod ? ".min" : "" }.js" defer="defer" />
		<script src="https://cdnjs.cloudflare.com/ajax/libs/redux/${ redux }/redux${ prod ? ".min" : "" }.js" defer="defer" />
		<script src="https://cdnjs.cloudflare.com/ajax/libs/react-redux/${ reactRedux }/react-redux${ prod ? ".min" : "" }.js" defer="defer" />
		<script src="index.js" defer="defer" />
	</head>
	<body>
		<div id="root" />
	</body>
</html>
`;

	writeFile("./www/index.xhtml", xhtml, "utf-8", err => {
		if (err) {
			reject(err);
			return;
		}
		resolve();
	});
})).catch(reason => {
	console.error(reason);
	process.exit(1);
});
