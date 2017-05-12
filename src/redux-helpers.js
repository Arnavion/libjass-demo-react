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

let lastActionId = 0;

export function makeUniqueActions(mapStateToProps, actions) {
	const result = Object.create(null);

	for (const [key, payloadCreator] of Object.entries(actions)) {
		const type = `${ lastActionId++ }-${ key }`;

		const action = (...args) => {
			const payload = payloadCreator(...args);

			return (typeof payload === "function") ?
				(dispatch, getState) => ({ type, payload: payload(dispatch, mapStateToProps(getState())) }) :
				{ type, payload };
		};

		action.type = type;

		result[key] = action;
	}

	return result;
};

export function createReducer(defaultState, actions) {
	return (state = defaultState, { type, payload }) => {
		const action = actions[type];

		if (typeof action === "function") {
			return action(state, payload);
		}

		return state;
	};
};
