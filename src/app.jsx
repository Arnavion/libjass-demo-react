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

import React, { Component } from "react";
import { connect } from "react-redux";
import { combineReducers } from "redux";

import { Console, reducer as consoleReducer } from "./console.jsx";
import { Actions, Options, reducer as optionsReducer } from "./options.jsx";
import { Video, reducer as videoReducer } from "./video.jsx";

const Screens = {
	Options: 0,
	Video: 1,
};

export const App = connect(({ app }) => app)(({
	currentScreen,
}) => (
	<div>
		<p>This is a version of <a href="https://github.com/Arnavion/libjass">libjass's</a> online <a href="https://arnavion.github.io/libjass/demo/">demo</a> made using <a href="https://facebook.github.io/react/">React.</a></p>

		{ (() => {
			switch (currentScreen) {
				case Screens.Options:
					return <Options />;

				case Screens.Video:
					return <Video />;
			}
		})() }

		<Console />

		<div>Found a bug? Please check if there's already a similar issue already reported at <a href="https://github.com/Arnavion/libjass/issues">https://github.com/Arnavion/libjass/issues</a> If there isn't, please open a new issue. You can also report it in the #libjass channel on the Rizon IRC network.</div>
		<div>Please include the following information in your bug report:
			<ul>
				<li>Your OS and browser versions. Eg: "Chrome 49 on Windows 7"</li>
				<li>A description of the bug. What did you expect to see? What happened instead? Eg: "All the subtitles are visible except the one at 00:00:05 'Was it you who broke the clock?'" or "The subtitle at 00:00:05 should be red but instead it's blue."</li>
				<li>If possible, a URL to the video and script that I can access for testing.</li>
				<li>Any text from the "Console output" section above.</li>
			</ul>
		</div>
	</div>
));

function appReducer(
	state = {
		currentScreen: Screens.Options,
	},
	action
) {
	switch (action.type) {
		case Actions.OptionsSelected:
			return {
				...state,
				currentScreen: Screens.Video,
			};

		default:
			return state;
	}
}

export const reducer = combineReducers({
	app: appReducer,
	console: consoleReducer,
	options: optionsReducer,
	video: videoReducer,
});
