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

import { createHash } from "crypto";
import { readFile, writeFile } from "fs";
import request from "request";
import { satisfies } from "semver";
import webpack from "webpack";

const prod = process.argv[2] === "prod";

const webpackConfig = require(`./webpack${ prod ? ".production" : "" }.config.js`);

const webpackIndexJs = new Promise((resolve, reject) => webpack(webpackConfig, (err, stats) => {
	if (err) {
		reject(err);
		return;
	}

	const { compilation: { errors, warnings } } = stats;

	if (errors.length !== 0) {
		for (const { message } of errors) {
			console.error(message);
		}

		reject();
		return;
	}

	if (warnings.length !== 0) {
		for (const { message } of warnings) {
			for (const warning of message.split("\n")) {
				if (
					warning.indexOf("from UglifyJs") === -1 &&
					warning.indexOf("libjass.min.js:") === -1 &&
					warning.indexOf("style-loader") === -1
				) {
					console.warn(warning);
				}
			}
		}
	}

	resolve();
}));

const getUrlBody = url => new Promise((resolve, reject) => request(url, (err, response, body) => {
	if (err) {
		reject(err);
		return;
	}

	if (response.statusCode !== 200) {
		reject(response.statusCode);
		return;
	}

	resolve(body);
}));

const getFileBody = filename => new Promise((resolve, reject) => readFile(filename, (err, body) => {
	if (err) {
		reject(err);
		return;
	}

	resolve(body);
}));

const getVersion = (name, requiredVersion) => getUrlBody(`https://api.cdnjs.com/libraries/${ name }`).then(body => {
	const { assets } = JSON.parse(body);

	for (const { version } of assets) {
		if (satisfies(version, requiredVersion)) {
			return version;
		}
	}

	throw new Error(`No version found for ${ name }:${ requiredVersion }.`);
});

const getHash = body => {
	const hash = createHash("sha384");
	hash.update(body);
	return `sha384-${ hash.digest("base64") }`;
};

const getScriptTag = (url, hash) => `<script src="${ url }" integrity="${ hash }" crossorigin="anonymous" defer="defer" />`;

const webScripts = [
	["babel-polyfill", "6.x",
		babelVersion => [`https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/${ babelVersion }/polyfill${ prod ? ".min" : "" }.js`]],
	["react", "15.x",
		reactVersion => [
			`https://cdnjs.cloudflare.com/ajax/libs/react/${ reactVersion }/react${ prod ? ".min" : "" }.js`,
			`https://cdnjs.cloudflare.com/ajax/libs/react/${ reactVersion }/react-dom${ prod ? ".min" : "" }.js`
		]],
	["react-redux", "4.x",
		reactReduxVersion => [`https://cdnjs.cloudflare.com/ajax/libs/react-redux/${ reactReduxVersion }/react-redux${ prod ? ".min" : "" }.js`]],
	["redux", "3.x",
		reduxVersion => [`https://cdnjs.cloudflare.com/ajax/libs/redux/${ reduxVersion }/redux${ prod ? ".min" : "" }.js`]],
	["redux-thunk", "2.x",
		reduxThunkVersion => [`https://cdnjs.cloudflare.com/ajax/libs/redux-thunk/${ reduxThunkVersion }/redux-thunk${ prod ? ".min" : "" }.js`]]
];

Promise.all(
	webScripts.map(([name, requiredVersion, urlsFunc]) =>
		getVersion(name, requiredVersion).then(version =>
			Promise.all(urlsFunc(version).map(url =>
				getUrlBody(url).then(body =>
					getScriptTag(url, getHash(body)))))))
	.concat(webpackIndexJs.then(() => getFileBody("./www/index.js")).then(body => getScriptTag("index.js", getHash(body))))
)
	.then(([
		[babelScriptTag],
		[reactScriptTag, reactDomScriptTag],
		[reactReduxScriptTag],
		[reduxScriptTag],
		[reduxThunkScriptTag],
		indexJsScriptTag
	]) => new Promise((resolve, reject) => {
		const xhtml =
`<?xml version="1.0" encoding="utf-8" ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
	<head>
		<title>libjass demo</title>
		${ babelScriptTag }
		${ reactScriptTag }
		${ reactDomScriptTag }
		${ reduxScriptTag }
		${ reduxThunkScriptTag }
		${ reactReduxScriptTag }
		${ indexJsScriptTag }
	</head>
	<body>
		<div id="root" />
	</body>
</html>
`;

		writeFile("./www/index.xhtml", xhtml, "utf8", err => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	}))
	.catch(reason => {
		console.error(reason);
		process.exit(1);
	});
