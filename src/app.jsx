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

import { Console } from "./console.jsx";
import { Options } from "./options.jsx";
import { Video } from "./video.jsx";

const Screens = {
	Options: 0,
	Video: 1,
};

export class App extends Component {
	constructor(...args) {
		super(...args);

		this.state = {
			currentScreen: Screens.Options,

			videoPromiseFunc: null,
			assPromise: null,
			enableSvg: null,
		};
	}

	render() {
		return (
			<div>
				<p>This is a demo page for the libjass library - a library for displaying ASS subtitles on HTML5 video. See the source of index.js for an explanation of how to use the library.</p>

				{ (() => {
					switch (this.state.currentScreen) {
						case Screens.Options:
							return (
								<Options
									onSelected={ (videoPromiseFunc, assPromise, enableSvg) => this.setState({ currentScreen: Screens.Video, videoPromiseFunc, assPromise, enableSvg }) }
								/>
							);

						case Screens.Video:
							return (
								<Video
									videoPromiseFunc={ this.state.videoPromiseFunc }
									assPromise={ this.state.assPromise }
									enableSvg = { this.state.enableSvg }
								/>
							);
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
		);
	}
}
