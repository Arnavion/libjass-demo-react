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

import defaultAssText from "raw!./default.ass";

import { makeDummyVideo } from "./dummy-video";

const VideoChoice = {
	LocalFile: 0,
	Url: 1,
	Sample: 2,
	Dummy: 3,
};

const AssChoice = {
	LocalFile: 0,
	Url: 1,
	Text: 2,
};

export class Options extends Component {
	constructor(...args) {
		super(...args);

		this.state = {
			videoChoice: VideoChoice.Sample,
			assChoice: AssChoice.Text,

			videoFile: null,
			videoUrl: null,
			videoDummyResolution: [1280, 720],
			videoDummyColor: "#2fa3fe",
			videoDummyDuration: 25 * 60,

			assFile: null,
			assUrl: null,
			assText: defaultAssText,
		};
	}

	render() {
		const fileInputsEnabled = (typeof URL !== "undefined" && typeof URL.createObjectURL === "function");
		const dummyVideoEnabled = (
			typeof HTMLCanvasElement.prototype.captureStream === "function" &&
			typeof MediaRecorder !== "undefined" &&
			typeof MediaSource !== "undefined" &&
			typeof MediaSource.isTypeSupported === "function"/* &&
			MediaSource.isTypeSupported("video/webm")*/
		);

		const videoOk = (() => {
			switch (this.state.videoChoice) {
				case VideoChoice.LocalFile:
					return this.state.videoFile !== null;
				case VideoChoice.Url:
					return this.state.videoUrl !== null;
				case VideoChoice.Sample:
					return true;
				case VideoChoice.Dummy:
					return (this.state.videoDummyResolution !== null) && (this.state.videoDummyColor !== null) && (this.state.videoDummyDuration !== null);
			}
		})();

		const assOk = (() => {
			switch (this.state.assChoice) {
				case AssChoice.LocalFile:
					return this.state.assFile !== null;
				case AssChoice.Url:
					return this.state.assUrl !== null;
				case AssChoice.Text:
					return this.state.assText !== null;
			}
		})();

		return (
			<div>
				<fieldset>
					<legend>Choose a video</legend>
					<ul className="choices-list">
						<li>
							<label>
								<input type="radio" name="video-choice"
									disabled={ !fileInputsEnabled }
									checked={ this.state.videoChoice === VideoChoice.LocalFile }
									onChange={ () => this.setState({ videoChoice: VideoChoice.LocalFile }) }
								/> Local file (The file won't be uploaded. It will be used directly within your browser.){
									fileInputsEnabled ?
										"" :
										" (This browser doesn't support URL.createObjectURL)"
								}
							</label>
							<input type="file"
								disabled={ !fileInputsEnabled }
								defaultValue={ null }
								onChange={ event =>
									this.setState({
										videoFile: (event.target.files.length === 1) ?
											event.target.files[0] :
											null
									})
								}
							/>
						</li>
						<li>
							<label>
								<input type="radio" name="video-choice"
									checked={ this.state.videoChoice === VideoChoice.Url }
									onChange={ () => this.setState({ videoChoice: VideoChoice.Url }) }
								/> Direct video URL (webm / MP4)
							</label>
							<input type="url"
								value={ this.state.videoUrl }
								onChange={ event =>
									this.setState({
										videoUrl: (event.target.parentElement.querySelector(":invalid") === null && event.target.value.length > 0) ?
											event.target.value :
											null
									})
								}
							/>
						</li>
						<li>
							<label>
								<input type="radio" name="video-choice"
									checked={ this.state.videoChoice === VideoChoice.Sample }
									onChange={ () => this.setState({ videoChoice: VideoChoice.Sample }) }
								/> Sample video (75s long 1280x720, meant to be used with the default "Text" ASS option below)
							</label>
						</li>
						<li>
							<label>
								<input type="radio" name="video-choice"
									disabled={ !dummyVideoEnabled }
									checked={ this.state.videoChoice === VideoChoice.Dummy }
									onChange={ () => this.setState({ videoChoice: VideoChoice.Dummy }) }
								/> Dummy video{
									dummyVideoEnabled ?
										"" :
										" (This browser doesn't support generating dummy video. Consider using Firefox 46 or newer and enabling media.mediasource.webm.enabled in about:config)"
								}
							</label>
							<select
								disabled={ !dummyVideoEnabled }
								value={ this.state.videoDummyResolution.join("x") }
								onChange={ event => this.setState({ videoDummyResolution: event.target.value.split("x") }) }
							>
								<option value="640x480">640 x 480 (SD fullscreen)</option>
								<option value="704x480">704 x 480 (SD anamorphic)</option>
								<option value="640x360">640 x 360 (SD widescreen)</option>
								<option value="704x396">704 x 396 (SD widescreen)</option>
								<option value="640x352">640 x 352 (SD widescreen MOD16)</option>
								<option value="704x400">704 x 400 (SD widescreen MOD16)</option>
								<option value="1280x720">1280 x 720 (HD 720p)</option>
								<option value="1920x1080">1920 x 1080 (HD 1080p)</option>
								<option value="1024x576">1024 x 576 (SuperPAL widescreen)</option>
							</select>
							<input type="color"
								disabled={ !dummyVideoEnabled }
								value={ this.state.videoDummyColor }
								onChange={ event => this.setState({ videoDummyColor: event.target.value }) }
							/>
							<label>
								<input type="number"
									disabled={ !dummyVideoEnabled }
									value={ Math.floor(this.state.videoDummyDuration / 60) }
									onChange={ event => {
										try {
											this.setState({ videoDummyDuration: parseInt(event.target.value) * 60 });
										}
										catch (ex) {
											this.setState({ videoDummyDuration: null });
										}
									} }
								/> mins
							</label>
						</li>
					</ul>
				</fieldset>
				<fieldset>
					<legend>Choose an ASS script</legend>
					<ul className="choices-list">
						<li>
							<label>
								<input type="radio" name="ass-choice"
									disabled={ !fileInputsEnabled }
									checked={ this.state.assChoice === AssChoice.LocalFile }
									onChange={ () => this.setState({ assChoice: AssChoice.LocalFile }) }
								/> Local file (The file won't be uploaded. It will be used directly within your browser.){
									fileInputsEnabled ?
										"" :
										" (This browser doesn't support URL.createObjectURL)"
								}
							</label>
							<input type="file"
								disabled={ !fileInputsEnabled }
								defaultValue={ null }
								onChange={ event =>
									this.setState({
										assFile: (event.target.files.length === 1) ?
											event.target.files[0] :
											null
									})
								}
							/>
						</li>
						<li>
							<label>
								<input type="radio" name="ass-choice"
									checked={ this.state.assChoice === AssChoice.Url }
									onChange={ () => this.setState({ assChoice: AssChoice.Url }) }
								/> Direct script URL (must be accessible via CORS)
							</label>
							<input type="url"
								value={ this.state.assUrl }
								onChange={ event =>
									this.setState({
										assUrl: (event.target.parentElement.querySelector(":invalid") === null && event.target.value.length > 0) ?
											event.target.value :
											null
									})
								}
							/>
						</li>
						<li>
							<label>
								<input type="radio" name="ass-choice"
									checked={ this.state.assChoice === AssChoice.Text }
									onChange={ () => this.setState({ assChoice: AssChoice.Text }) }
								/> Text
							</label>
							<textarea
								value={ this.state.assText }
								onChange={ event =>
									this.setState({
										assText: (event.target.value.length > 0) ?
											event.target.value :
											null
									})
								}
							/>
						</li>
					</ul>
				</fieldset>
				<button type="button"
					disabled={ !videoOk || !assOk }
					onClick={ () => {
						let videoPromiseFunc = null;

						switch (this.state.videoChoice) {
							case VideoChoice.LocalFile:
								videoPromiseFunc = prepareVideo(this.state.videoChoice, URL.createObjectURL(this.state.videoFile));
								break;
							case VideoChoice.Url:
								videoPromiseFunc = prepareVideo(this.state.videoChoice, this.state.videoUrl);
								break;
							case VideoChoice.Sample:
								videoPromiseFunc = prepareVideo(this.state.videoChoice);
								break;
							case VideoChoice.Dummy:
								videoPromiseFunc = prepareVideo(this.state.videoChoice, this.state.videoDummyResolution, this.state.videoDummyColor, this.state.videoDummyDuration);
								break;
						}

						let assPromise = null;

						switch (this.state.assChoice) {
							case AssChoice.LocalFile:
								assPromise = libjass.ASS.fromUrl(URL.createObjectURL(this.state.assFile));
								break;
							case AssChoice.Url:
								assPromise = libjass.ASS.fromUrl(this.state.assUrl);
								break;
							case AssChoice.Text:
								assPromise = libjass.ASS.fromString(this.state.assText);
								break;
						}

						this.props.onSelected(videoPromiseFunc, assPromise);
					} }
				>Go</button>
			</div>
		);
	}
};

Options.propTypes = {
	onSelected: PropTypes.func.isRequired
};

function prepareVideo(videoChoice, ...parameters) {
	return video => {
		switch (videoChoice) {
			case VideoChoice.Dummy:
				const [[width, height], color, duration] = parameters;
				return makeDummyVideo(video, width, height, color, duration);

			case VideoChoice.LocalFile:
			case VideoChoice.Url:
				const [videoUrl] = parameters;

				/* Set the <video> element's src to the given URL
				 */
				video.src = videoUrl;
				break;

			case VideoChoice.Sample:
				/* Add <source> elements for the two sample videos.
				 */
				const webmSource = document.createElement("source");
				video.appendChild(webmSource);
				webmSource.type = "video/webm";
				webmSource.src = "sample.webm";

				const mp4Source = document.createElement("source");
				video.appendChild(mp4Source);
				mp4Source.type = "video/mp4";
				mp4Source.src = "sample.mp4";
				break;

			default:
				throw new Error(`Unrecognized videoChoice ${ videoChoice }`);
		}

		return new libjass.Promise((resolve, reject) => {
			if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
				// Video metadata isn't available yet. Register an event handler for it.
				video.addEventListener("loadedmetadata", resolve, false);
				video.addEventListener("error", () => reject(video.error), false);
			}
			else {
				// Video metadata is already available.
				resolve();
			}
		});
	};
}
