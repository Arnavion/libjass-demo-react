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
import React from "react";
import { connect } from "react-redux";

import { createReducer, makeUniqueActions } from "./redux-helpers";

import defaultAssText from "raw!./default.ass";

export const VideoChoice = {
	LocalFile: 0,
	Url: 1,
	Sample: 2,
	Dummy: 3,
};

export const AssChoice = {
	LocalFile: 0,
	Url: 1,
	Text: 2,
};

function _Options({
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
}) {
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
							accept="video/*"
							disabled={ !fileInputsEnabled }
							defaultValue={ null }
							onChange={ event =>
								onVideoFileChanged(
									(event.target.files.length === 1) ?
										URL.createObjectURL(event.target.files[0]) :
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
							value={ (videoUrl === null) ? "" : videoUrl }
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
							accept=".ass"
							disabled={ !fileInputsEnabled }
							defaultValue={ null }
							onChange={ event =>
								onAssFileChanged(
									(event.target.files.length === 1) ?
										URL.createObjectURL(event.target.files[0]) :
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
							value={ (assUrl === null) ? "" : assUrl }
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
								onAssTextChanged(
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
					onSelected(
						videoChoice,
						videoFile,
						videoUrl,
						videoDummyResolution,
						videoDummyColor,
						videoDummyDuration,

						assChoice,
						assFile,
						assUrl,
						assText,

						enableSvg
					);
				} }
			>Go</button>
		</div>
	);
}

export const Actions = makeUniqueActions({
	onVideoChoiceChanged: videoChoice => ({ videoChoice }),

	onVideoFileChanged: videoFile => ({ videoFile }),

	onVideoUrlChanged: videoUrl => ({ videoUrl }),

	onVideoDummyResolutionChanged: videoDummyResolution => ({ videoDummyResolution }),

	onVideoDummyColorChanged: videoDummyColor => ({ videoDummyColor }),

	onVideoDummyDurationChanged: videoDummyDuration => ({ videoDummyDuration }),

	onAssChoiceChanged: assChoice => ({ assChoice }),

	onAssFileChanged: assFile => ({ assFile }),

	onAssUrlChanged: assUrl => ({ assUrl }),

	onAssTextChanged: assText => ({ assText }),

	onEnableDisableSvg: enableSvg => ({ enableSvg }),

	onSelected: (
		videoChoice,
		videoFile,
		videoUrl,
		videoDummyResolution,
		videoDummyColor,
		videoDummyDuration,

		assChoice,
		assFile,
		assUrl,
		assText,

		enableSvg
	) => ({
		videoChoice,
		videoFile,
		videoUrl,
		videoDummyResolution,
		videoDummyColor,
		videoDummyDuration,

		assChoice,
		assFile,
		assUrl,
		assText,

		enableSvg,
	}),
});

export const Options = connect(({ options }) => options, Actions)(props => <_Options { ...props } />);

export const reducer = createReducer({
	videoChoice: VideoChoice.Sample,
	videoFile: null,
	videoUrl: null,
	videoDummyResolution: [1280, 720],
	videoDummyColor: "#2fa3fe",
	videoDummyDuration: 25 * 60,

	assChoice: AssChoice.Text,
	assFile: null,
	assUrl: null,
	assText: defaultAssText,

	enableSvg: null,
}, {
	[Actions.onVideoChoiceChanged.type]: (state, { videoChoice }) => ({ ...state, videoChoice }),

	[Actions.onVideoFileChanged.type]: (state, { videoFile }) => {
		const { videoFile: previousVideoFile } = state;
		if (previousVideoFile !== null) {
			URL.revokeObjectURL(previousVideoFile);
		}

		return {
			...state,
			videoFile,
		};
	},

	[Actions.onVideoUrlChanged.type]: (state, { videoUrl }) => ({ ...state, videoUrl }),

	[Actions.onVideoDummyResolutionChanged.type]: (state, { videoDummyResolution }) => ({ ...state, videoDummyResolution }),

	[Actions.onVideoDummyColorChanged.type]: (state, { videoDummyColor }) => ({ ...state, videoDummyColor }),

	[Actions.onVideoDummyDurationChanged.type]: (state, { videoDummyDuration }) => ({ ...state, videoDummyDuration }),

	[Actions.onAssChoiceChanged.type]: (state, { assChoice }) => ({ ...state, assChoice }),

	[Actions.onAssFileChanged.type]: (state, { assFile }) => {
		const { assFile: previousAssFile } = state;
		if (previousAssFile !== null) {
			URL.revokeObjectURL(previousAssFile);
		}

		return {
			...state,
			assFile,
		};
	},

	[Actions.onAssUrlChanged.type]: (state, { assUrl }) => ({ ...state, assUrl }),

	[Actions.onAssTextChanged.type]: (state, { assText }) => ({ ...state, assText }),

	[Actions.onEnableDisableSvg.type]: (state, { enableSvg }) => ({ ...state, enableSvg }),
});
