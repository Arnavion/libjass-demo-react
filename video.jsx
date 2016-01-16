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

import libjass from "./libjass.js";

export class Video extends Component {
	constructor(props) {
		super(props);

		this.state = {
			videoResolution: null,
			assResolution: null,

			subsEnabled: true,

			currentResolution: null,

			renderer: null,
		};
	}

	render() {
		if (this.state.renderer !== null) {
			this.state.renderer.setEnabled(this.state.subsEnabled);
		}

		return (
			<div>
				<div ref="subsWrapper">
					<video controls={ true } ref="video"
						width={ (this.state.currentResolution !== null) ? this.state.currentResolution[0] : "" }
						height={ (this.state.currentResolution !== null) ? this.state.currentResolution[1] : "" }
					/>
				</div>

				<form className="settings-form">
					<fieldset>
						<legend>Video size</legend>
						<div>
							<label>
								<input type="radio" name="video-size"
									defaultChecked={ true }
									onChange={ () => {
										this.setState({ currentResolution: [...this.state.videoResolution] });
										this.state.renderer.resize(this.state.videoResolution[0], this.state.videoResolution[1]);
									} }
								/> Video resolution {
									(this.state.videoResolution !== null) ?
										this.state.videoResolution[0] :
										""
								}x{
									(this.state.videoResolution !== null) ?
										this.state.videoResolution[1] :
										""
								}
							</label>
							<label>
								<input type="radio" name="video-size"
									onChange={ () => {
										this.setState({ currentResolution: [...this.state.assResolution] });
										this.state.renderer.resize(this.state.assResolution[0], this.state.assResolution[1]);
									} }
								/> Script resolution {
									(this.state.assResolution !== null) ?
										this.state.assResolution[0] :
										""
								}x{
									(this.state.assResolution !== null) ?
										this.state.assResolution[1] :
										""
								}
							</label>
						</div>
					</fieldset>
					<fieldset>
						<legend>Subtitles</legend>
						<label><input type="checkbox"
							checked={ this.state.subsEnabled }
							onChange={ event => this.setState({ subsEnabled: event.target.checked }) }
						/>Subtitles</label>
					</fieldset>
				</form>
			</div>
		);
	}

	componentDidMount() {
		const video = this.refs.video;

		const videoPromise =
			this.props.videoPromiseFunc(video).then(() => {
				console.log("Video metadata loaded.");

				const videoResolution = [video.videoWidth, video.videoHeight];
				this.setState({ videoResolution, currentResolution: [...videoResolution] });
			}).catch(reason => {
				const errorCode = (reason.code !== undefined) ? [null, "MEDIA_ERR_ABORTED", "MEDIA_ERR_NETWORK", "MEDIA_ERR_DECODE", "MEDIA_ERR_SRC_NOT_SUPPORTED"][reason.code] : "";
				console.error("Video could not be loaded: %o %o", errorCode, reason);

				throw reason;
			});

		const assLoadedPromise = this.props.assPromise.then(ass => {
			console.log("Script received.");

			window.ass = ass;

			this.setState({ assResolution: [ass.properties.resolutionX, ass.properties.resolutionY] });

			return ass;
		}).catch(reason => {
			console.error("ASS could not be loaded: %o", reason);
			throw reason;
		});

		libjass.Promise.all([videoPromise, assLoadedPromise]).then(([, ass]) => {
			const renderer = new libjass.renderers.WebRenderer(ass, new libjass.renderers.VideoClock(video), this.refs.subsWrapper, {
				enableSvg: (navigator.userAgent.indexOf("Trident") === -1) && (location.search.indexOf("disableSvg") === -1)
			});

			window.renderer = renderer;

			renderer.addEventListener("ready", () => {
				console.log("Beginning autoplay.");

				video.play();
			});

			renderer.resize(...this.state.currentResolution);

			this.setState({ renderer });
		});
	}
};

Video.propTypes = {
	videoPromiseFunc: PropTypes.func.isRequired,
	assPromise: PropTypes.instanceOf(libjass.Promise),
};
