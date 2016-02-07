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

import React, { Component, PropTypes } from "react";

import libjass from "libjass";

export class Console extends Component {
	constructor(...args) {
		super(...args);

		this.state = {
			entries: [],
		};
	}

	render() {
		return (
			<fieldset className="console">
				<legend>
					Console output
					<label>
						<input type="checkbox"
							onChange={ event => {
								console.log(`${ event.target.checked ? "Enabling" : "Disabling" } debug mode.`);

								libjass.debugMode = event.target.checked;
							} }
						/> Enable debug mode
					</label>
					<label>
						<input type="checkbox"
							onChange={ event => {
								console.log(`${ event.target.checked ? "Enabling" : "Disabling" } verbose mode.`);

								libjass.verboseMode = event.target.checked;
							} }
						/> Enable verbose mode
					</label>
				</legend>
				{
					this.state.entries.map((entry, i) =>
						<div key={ i } className={ entry.type }>{ entry.text }</div>
					)
				}
			</fieldset>
		);
	}

	componentDidMount() {
		const originalConsoleLog = console.log.bind(console);
		const originalConsoleWarn = console.warn.bind(console);
		const originalConsoleError = console.error.bind(console);

		console.log = (...items) => {
			originalConsoleLog(...items);
			this.add("log", items);
		};
		console.warn = (...items) => {
			originalConsoleWarn(...items);
			this.add("warning", items);
		};
		console.error = (...items) => {
			originalConsoleError(...items);
			this.add("error", items);
		};
	}

	add(type, items) {
		const text = items.reduce((text, item) => {
			switch (typeof item) {
				case "boolean":
				case "number":
				case "string":
					return `${ text }${ item } `;
				default:
					return `${ text }${ item } [Check browser console for more details.] `;
			}
		}, `${ new Date().toString() }: `);

		libjass.Promise.resolve().then(() =>
			this.setState({ entries: [...this.state.entries, { type, text }] })
		);
	}
}
