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

import defaultAssText from "raw!./default.ass";

import { makeDummyVideo } from "./dummy-video";

function mapDispatchToProps(dispatch) {
	return {
		onVideoChoiceChanged(videoChoice) {
			dispatch({
				type: Actions.VideoChoiceChanged,
				payload: {
					videoChoice
				}
			});
		},

		onVideoFileChanged(videoFile) {
			dispatch({
				type: Actions.VideoFileChanged,
				payload: {
					videoFile
				}
			});
		},

		onVideoUrlChanged(videoUrl) {
			dispatch({
				type: Actions.VideoUrlChanged,
				payload: {
					videoUrl
				}
			});
		},

		onVideoDummyResolutionChanged(videoDummyResolution) {
			dispatch({
				type: Actions.VideoDummyResolutionChanged,
				payload: {
					videoDummyResolution
				}
			});
		},

		onVideoDummyColorChanged(videoDummyColor) {
			dispatch({
				type: Actions.VideoDummyColorChanged,
				payload: {
					videoDummyColor
				}
			});
		},

		onVideoDummyDurationChanged(videoDummyDuration) {
			dispatch({
				type: Actions.VideoDummyDurationChanged,
				payload: {
					videoDummyDuration
				}
			});
		},

		onAssChoiceChanged(assChoice) {
			dispatch({
				type: Actions.AssChoiceChanged,
				payload: {
					assChoice
				}
			});
		},

		onAssFileChanged(assFile) {
			dispatch({
				type: Actions.AssFileChanged,
				payload: {
					assFile
				}
			});
		},

		onAssUrlChanged(assUrl) {
			dispatch({
				type: Actions.AssUrlChanged,
				payload: {
					assUrl
				}
			});
		},

		onAssTextChanged(assText) {
			dispatch({
				type: Actions.AssTextChanged,
				payload: {
					assText
				}
			});
		},

		onEnableDisableSvg(enableSvg) {
			dispatch({
				type: Actions.EnableDisableSvg,
				payload: {
					enableSvg
				}
			});
		},

		onSelected(videoPromiseFunc, assPromise, enableSvg) {
			dispatch({
				type: Actions.OptionsSelected,
				payload: {
					videoPromiseFunc,
					assPromise,
					enableSvg,
				}
			});
		},
	};
}

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

export const Options = connect(({ options }) => options, mapDispatchToProps)(({
	videoChoice,
	assChoice,

	videoFile,
	videoUrl,
	videoDummyResolution,
	videoDummyColor,
	videoDummyDuration,

	assFile,
	assUrl,
	assText,

	enableSvg,

	videoPromiseFunc,
	assPromise,

	onVideoChoiceChanged,
	onVideoFileChanged,
	onVideoUrlChanged,
	onVideoDummyResolutionChanged,
	onVideoDummyColorChanged,
	onVideoDummyDurationChanged,

	onAssChoiceChanged,
	onAssFileChanged,
	onAssUrlChanged,
	onAssTextChanged,

	onEnableDisableSvg,

	onSelected,
}) => {
	const fileInputsEnabled = (typeof URL !== "undefined" && typeof URL.createObjectURL === "function");
	const dummyVideoEnabled = (
		typeof HTMLCanvasElement.prototype.captureStream === "function" &&
		typeof MediaRecorder !== "undefined" &&
		typeof MediaSource !== "undefined" &&
		typeof MediaSource.isTypeSupported === "function"/* &&
		MediaSource.isTypeSupported("video/webm")*/
	);

	const videoOk = (() => {
		switch (videoChoice) {
			case VideoChoice.LocalFile:
				return videoFile !== null;
			case VideoChoice.Url:
				return videoUrl !== null;
			case VideoChoice.Sample:
				return true;
			case VideoChoice.Dummy:
				return (videoDummyResolution !== null) && (videoDummyColor !== null) && (videoDummyDuration !== null);
		}
	})();

	const assOk = (() => {
		switch (assChoice) {
			case AssChoice.LocalFile:
				return assFile !== null;
			case AssChoice.Url:
				return assUrl !== null;
			case AssChoice.Text:
				return assText !== null;
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
								checked={ videoChoice === VideoChoice.LocalFile }
								onChange={ () => onVideoChoiceChanged(VideoChoice.LocalFile) }
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
								onVideoFileChanged(
									(event.target.files.length === 1) ?
										event.target.files[0] :
										null
								)
							}
						/>
					</li>
					<li>
						<label>
							<input type="radio" name="video-choice"
								checked={ videoChoice === VideoChoice.Url }
								onChange={ () => onVideoChoiceChanged(VideoChoice.Url) }
							/> Direct video URL (webm / MP4)
						</label>
						<input type="url"
							value={ videoUrl }
							onChange={ event =>
								onVideoUrlChanged(
									(event.target.parentElement.querySelector(":invalid") === null && event.target.value.length > 0) ?
										event.target.value :
										null
								)
							}
						/>
					</li>
					<li>
						<label>
							<input type="radio" name="video-choice"
								checked={ videoChoice === VideoChoice.Sample }
								onChange={ () => onVideoChoiceChanged(VideoChoice.Sample) }
							/> Sample video (75s long 1280x720, meant to be used with the default "Text" ASS option below)
						</label>
					</li>
					<li>
						<label>
							<input type="radio" name="video-choice"
								disabled={ !dummyVideoEnabled }
								checked={ videoChoice === VideoChoice.Dummy }
								onChange={ () => onVideoChoiceChanged(VideoChoice.Dummy) }
							/> Dummy video{
								dummyVideoEnabled ?
									"" :
									" (This browser doesn't support generating dummy video. Consider using Firefox 46 or newer and enabling media.mediasource.webm.enabled in about:config)"
							}
						</label>
						<select
							disabled={ !dummyVideoEnabled }
							value={ videoDummyResolution.join("x") }
							onChange={ event => onVideoDummyResolutionChanged(event.target.value.split("x")) }
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
							value={ videoDummyColor }
							onChange={ event => onVideoDummyColorChanged(event.target.value) }
						/>
						<label>
							<input type="number"
								disabled={ !dummyVideoEnabled }
								value={ Math.floor(videoDummyDuration / 60) }
								onChange={ event => {
									try {
										onVideoDummyDurationChanged(parseInt(event.target.value) * 60);
									}
									catch (ex) {
										onVideoDummyDurationChanged(null);
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
								checked={ assChoice === AssChoice.LocalFile }
								onChange={ () => onAssChoiceChanged(AssChoice.LocalFile) }
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
								onAssFileChanged(
									(event.target.files.length === 1) ?
										event.target.files[0] :
										null
								)
							}
						/>
					</li>
					<li>
						<label>
							<input type="radio" name="ass-choice"
								checked={ assChoice === AssChoice.Url }
								onChange={ () => onAssChoiceChanged(AssChoice.Url) }
							/> Direct script URL (must be accessible via CORS)
						</label>
						<input type="url"
							value={ assUrl }
							onChange={ event =>
								onAssUrlChanged(
									(event.target.parentElement.querySelector(":invalid") === null && event.target.value.length > 0) ?
										event.target.value :
										null
								)
							}
						/>
					</li>
					<li>
						<label>
							<input type="radio" name="ass-choice"
								checked={ assChoice === AssChoice.Text }
								onChange={ () => onAssChoiceChanged(AssChoice.Text) }
							/> Text
						</label>
						<textarea
							value={ assText }
							onChange={ event =>
								onAssTexthanged(
									(event.target.value.length > 0) ?
										event.target.value :
										null
								)
							}
						/>
					</li>
				</ul>
			</fieldset>

			<fieldset>
				<legend>Other options</legend>
				<ul>
					<li>
						Does the M at the end of this question appear red or black? <span style={ { color: "black", WebkitFilter: 'url("#redtext")', filter: 'url("#redtext")' } }>M</span>
						<label>
							<input type="radio" name="enable-svg"
								checked={ enableSvg === true }
								onChange={ () => onEnableDisableSvg(true) }
							/> Red
						</label>
						<label>
							<input type="radio" name="enable-svg"
								checked={ enableSvg === false }
								onChange={ () => onEnableDisableSvg(false) }
							/> Black
						</label>
						<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="0" height="0">
							<defs>
								<filter id="redtext" x="-50%" y="-50%" width="200%" height="200%">
									<feComponentTransfer in="SourceAlpha">
										<feFuncR type="linear" slope="0" intercept="1" />
										<feFuncG type="linear" slope="0" intercept="0" />
										<feFuncB type="linear" slope="0" intercept="0" />
										<feFuncA type="linear" slope="1" intercept="0" />
									</feComponentTransfer>
								</filter>
							</defs>
						</svg>
					</li>
				</ul>
			</fieldset>

			<button type="button"
				disabled={ !videoOk || !assOk }
				onClick={ () => {
					let videoPromiseFunc = null;

					switch (videoChoice) {
						case VideoChoice.LocalFile:
							videoPromiseFunc = prepareVideo(videoChoice, URL.createObjectURL(videoFile));
							break;
						case VideoChoice.Url:
							videoPromiseFunc = prepareVideo(videoChoice, videoUrl);
							break;
						case VideoChoice.Sample:
							videoPromiseFunc = prepareVideo(videoChoice);
							break;
						case VideoChoice.Dummy:
							videoPromiseFunc = prepareVideo(videoChoice, videoDummyResolution, videoDummyColor, videoDummyDuration);
							break;
					}

					let assPromise = null;

					switch (assChoice) {
						case AssChoice.LocalFile:
							assPromise = libjass.ASS.fromUrl(URL.createObjectURL(assFile));
							break;
						case AssChoice.Url:
							assPromise = libjass.ASS.fromUrl(assUrl);
							break;
						case AssChoice.Text:
							assPromise = libjass.ASS.fromString(assText);
							break;
					}

					onSelected(videoPromiseFunc, assPromise, enableSvg);
				} }
			>Go</button>
		</div>
	);
});

export const Actions = {
	VideoChoiceChanged: 1,
	VideoFileChanged: 2,
	VideoUrlChanged: 3,
	VideoDummyResolutionChanged: 4,
	VideoDummyColorChanged: 5,
	VideoDummyDurationChanged: 6,

	AssChoiceChanged: 7,
	AssFileChanged: 8,
	AssUrlChanged: 9,
	AssTextChanged: 10,

	EnableDisableSvg: 11,

	OptionsSelected: 12,
};

export function reducer(
	state = {
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

		enableSvg: null,

		videoPromiseFunc: null,
		assPromise: null,
	},
	action
) {
	switch (action.type) {
		case Actions.OptionsSelected: {
				const { videoPromiseFunc, assPromise, enableSvg } = action.payload;
				return {
					...state,
					videoPromiseFunc,
					assPromise,
					enableSvg,
				}
			}

		case Actions.VideoChoiceChanged:
			const { videoChoice } = action.payload;
			return {
				...state,
				videoChoice,
			}

		case Actions.VideoFileChanged:
			const { videoFile } = action.payload;
			return {
				...state,
				videoFile,
			}

		case Actions.VideoUrlChanged:
			const { videoUrl } = action.payload;
			return {
				...state,
				videoUrl,
			}

		case Actions.VideoDummyResolutionChanged:
			const { videoDummyResolution } = action.payload;
			return {
				...state,
				videoDummyResolution,
			}

		case Actions.VideoDummyColorChanged:
			const { videoDummyColor } = action.payload;
			return {
				...state,
				videoDummyColor,
			}

		case Actions.VideoDummyDurationChanged:
			const { videoDummyDuration } = action.payload;
			return {
				...state,
				videoDummyDuration,
			}

		case Actions.AssChoiceChanged:
			const { assChoice } = action.payload;
			return {
				...state,
				assChoice,
			}

		case Actions.AssFileChanged:
			const { assFile } = action.payload;
			return {
				...state,
				assFile,
			}

		case Actions.AssUrlChanged:
			const { assUrl } = action.payload;
			return {
				...state,
				assUrl,
			}

		case Actions.AssTextChanged:
			const { assText } = action.payload;
			return {
				...state,
				assText,
			}

		case Actions.EnableDisableSvg: {
				const { enableSvg } = action.payload;
				return {
					...state,
					enableSvg,
				}
			}

		default:
			return state;
	}
}

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
