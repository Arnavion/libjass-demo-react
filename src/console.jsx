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

import { createReducer, makeUniqueActions } from "./redux-helpers";

function _Console({
	entries,
	debugMode,
	verboseMode,

	onEnableDisableDebugMode,
	onEnableDisableVerboseMode,
	onClear,
}) {
	return (
		<fieldset className="console">
			<legend>
				Console output
				<label>
					<input type="checkbox"
						checked={ debugMode }
						onChange={ event => onEnableDisableDebugMode(event.target.checked) }
					/> Enable debug mode
				</label>
				<label>
					<input type="checkbox"
						checked={ verboseMode }
						onChange={ event => onEnableDisableVerboseMode(event.target.checked) }
					/> Enable verbose mode
				</label>
				<button type="button"
					onClick={ onClear }
				>Clear</button>
			</legend>
			{
				entries.map(({ id, type, text }) =>
					<div key={ id } className={ type }>{ text }</div>
				)
			}
		</fieldset>
	);
}

const Actions = makeUniqueActions({
	onMount: () => dispatch => {
		const originalConsoleLog = console.log.bind(console);
		console.log = (...items) => {
			originalConsoleLog(...items);
			dispatch(Actions.onAdd("log", items));
		};

		const originalConsoleWarn = console.warn.bind(console);
		console.warn = (...items) => {
			originalConsoleWarn(...items);
			dispatch(Actions.onAdd("warning", items));
		};

		const originalConsoleError = console.error.bind(console);
		console.error = (...items) => {
			originalConsoleError(...items);
			dispatch(Actions.onAdd("error", items));
		};
	},

	onAdd: (type, items) => {
		let hasNonPrimitives = false;

		const text = items.reduce((text, item) => {
			switch (typeof item) {
				case "boolean":
				case "number":
				case "string":
					break;
				default:
					hasNonPrimitives = true;
					break;
			}

			return `${ text } ${ item }`;
		}, `${ new Date().toString() }:`);

		return { type, text: hasNonPrimitives ? `${ text } [Check browser console for more details.]` : text };
	},

	onEnableDisableDebugMode: debugMode => dispatch => {
		console.log(`${ debugMode ? "Enabling" : "Disabling" } debug mode.`);

		libjass.debugMode = debugMode;

		dispatch({ type: Actions.onEnableDisableDebugMode.type, payload: { debugMode } });
	},

	onEnableDisableVerboseMode: verboseMode => dispatch => {
		console.log(`${ verboseMode ? "Enabling" : "Disabling" } verbose mode.`);

		libjass.verboseMode = verboseMode;

		dispatch({ type: Actions.onEnableDisableVerboseMode.type, payload: { verboseMode } });
	},

	onClear: () => undefined,
});

export const Console = connect(({ console }) => console, Actions)(class extends Component {
	render() {
		const {
			entries,
			debugMode,
			verboseMode,

			onEnableDisableDebugMode,
			onEnableDisableVerboseMode,
			onClear,
		} = this.props;

		return (
			<_Console { ...{
				entries,
				debugMode,
				verboseMode,

				onEnableDisableDebugMode,
				onEnableDisableVerboseMode,
				onClear
			} } />
		);
	}

	componentDidMount() {
		this.props.onMount();
	}
});

export const reducer = createReducer({
	entries: [],
	lastItemId: 0,

	debugMode: false,
	verboseMode: false,
}, {
	[Actions.onAdd.type]: (state, { type, text }) => ({
		...state,
		entries: [
			...state.entries,
			{ id: state.lastItemId, type, text },
		],
		lastItemId: state.lastItemId + 1,
	}),

	[Actions.onEnableDisableDebugMode.type]: (state, { debugMode }) => ({ ...state, debugMode }),

	[Actions.onEnableDisableVerboseMode.type]: (state, { verboseMode }) => ({ ...state, verboseMode }),

	[Actions.onClear.type]: state => ({ ...state, entries: [] }),
});
