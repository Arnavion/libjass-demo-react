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

import libjass from "libjass";
import React, { Component } from "react";
import { connect } from "react-redux";

function mapDispatchToProps(dispatch) {
	return {
		onAdd(type, text) {
			dispatch({
				type: Actions.ConsoleAdd,
				payload: {
					type,
					text,
				}
			});
		},
	};
}

export const Console = connect(({ console }) => console, mapDispatchToProps)(class extends Component {
	render() {
		const { entries } = this.props;

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
					entries.map((entry, i) =>
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
			this._add("log", items);
		};
		console.warn = (...items) => {
			originalConsoleWarn(...items);
			this._add("warning", items);
		};
		console.error = (...items) => {
			originalConsoleError(...items);
			this._add("error", items);
		};
	}

	_add(type, items) {
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

		Promise.resolve().then(() => this.props.onAdd(type, text));
	}
});

const Actions = {
	ConsoleAdd: 0,
};

export function reducer(
	state = {
		entries: [],
	},
	action
) {
	switch (action.type) {
		case Actions.ConsoleAdd:
			const { type, text } = action.payload;
			return {
				entries: [
					...state.entries,
					{ type, text }
				]
			};

		default:
			return state;
	}
}
