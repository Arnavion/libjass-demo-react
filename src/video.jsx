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

import { makeDummyVideo } from "./dummy-video";
import { VideoChoice, AssChoice } from "./options.jsx";

function mapStateToProps({
	options: {
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
	},
	video
}) {
	return {
		...video,

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
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onChangeToVideoResolution() {
			dispatch({
				type: Actions.ChangeToVideoResolution,
			});
		},

		onChangeToScriptResolution() {
			dispatch({
				type: Actions.ChangeToScriptResolution,
			});
		},

		onEnableDisableSubs(subsEnabled) {
			dispatch({
				type: Actions.EnableDisableSubs,
				payload: {
					subsEnabled,
				},
			});
		},

		onVideoMetadataLoaded(videoResolution) {
			dispatch({
				type: Actions.VideoMetadataLoaded,
				payload: {
					videoResolution,
				},
			});
		},

		onScriptLoaded(assResolution) {
			dispatch({
				type: Actions.ScriptLoaded,
				payload: {
					assResolution,
				},
			});
		},

		onRendererCreated(renderer) {
			dispatch({
				type: Actions.RendererCreated,
				payload: {
					renderer,
				},
			});
		},
	};
}

export const Video = connect(mapStateToProps, mapDispatchToProps)(class extends Component {
	render() {
		const {
			videoResolution, assResolution,
			subsEnabled,
			currentResolution,
			renderer,

			onChangeToVideoResolution,
			onChangeToScriptResolution,
			onEnableDisableSubs,
		} = this.props;

		if (renderer !== null) {
			renderer.setEnabled(subsEnabled);
			renderer.resize(...currentResolution);
		}

		return (
			<div>
				<div ref="subsWrapper">
					<video controls={ true } ref="video"
						width={ (currentResolution !== null) ? currentResolution[0] : "" }
						height={ (currentResolution !== null) ? currentResolution[1] : "" }
					/>
				</div>

				<form className="settings-form">
					<fieldset>
						<legend>Video size</legend>
						<div>
							<label>
								<input type="radio" name="video-size"
									defaultChecked={ true }
									onChange={ onChangeToVideoResolution }
								/> Video resolution {
									(videoResolution !== null) ?
										videoResolution[0] :
										""
								}x{
									(videoResolution !== null) ?
										videoResolution[1] :
										""
								}
							</label>
							<label>
								<input type="radio" name="video-size"
									onChange={ onChangeToScriptResolution }
								/> Script resolution {
									(assResolution !== null) ?
										assResolution[0] :
										""
								}x{
									(assResolution !== null) ?
										assResolution[1] :
										""
								}
							</label>
						</div>
					</fieldset>
					<fieldset>
						<legend>Subtitles</legend>
						<label><input type="checkbox"
							checked={ subsEnabled }
							onChange={ event => onEnableDisableSubs(event.target.checked) }
						/>Subtitles</label>
					</fieldset>
				</form>
			</div>
		);
	}

	componentDidMount() {
		const {
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

			onVideoMetadataLoaded,
			onScriptLoaded,
			onRendererCreated,
		} = this.props;

		const { video } = this.refs;

		let videoPromise = null;

		switch (videoChoice) {
			case VideoChoice.LocalFile:
				video.src = URL.createObjectURL(videoFile);
				videoPromise = metadataLoaded(video);
				break;

			case VideoChoice.Url:
				video.src = videoUrl;
				videoPromise = metadataLoaded(video);
				break;

			case VideoChoice.Sample:
				const webmSource = document.createElement("source");
				video.appendChild(webmSource);
				webmSource.type = "video/webm";
				webmSource.src = "sample.webm";

				const mp4Source = document.createElement("source");
				video.appendChild(mp4Source);
				mp4Source.type = "video/mp4";
				mp4Source.src = "sample.mp4";

				videoPromise = metadataLoaded(video);
				break;

			case VideoChoice.Dummy:
				const [dummyVideoWidth, dummyVideoHeight] = videoDummyResolution;
				videoPromise = makeDummyVideo(video, dummyVideoWidth, dummyVideoHeight, videoDummyColor, videoDummyDuration);
				break;
		}

		videoPromise =
			videoPromise.then(() => {
				console.log("Video metadata loaded.");

				onVideoMetadataLoaded([video.videoWidth, video.videoHeight]);
			}).catch(reason => {
				const errorCode = (reason.code !== undefined) ? [null, "MEDIA_ERR_ABORTED", "MEDIA_ERR_NETWORK", "MEDIA_ERR_DECODE", "MEDIA_ERR_SRC_NOT_SUPPORTED"][reason.code] : "";
				console.error("Video could not be loaded: %o %o", errorCode, reason);

				throw reason;
			});

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

		assPromise = assPromise.then(ass => {
			console.log("Script received.");

			window.ass = ass;

			onScriptLoaded([ass.properties.resolutionX, ass.properties.resolutionY]);

			return ass;
		}).catch(reason => {
			console.error("ASS could not be loaded: %o", reason);
			throw reason;
		});

		Promise.all([videoPromise, assPromise]).then(([, ass]) => {
			const rendererSettings = { };
			if (enableSvg !== null) {
				rendererSettings.enableSvg = enableSvg;
			}
			const renderer = new libjass.renderers.WebRenderer(ass, new libjass.renderers.VideoClock(video), this.refs.subsWrapper, rendererSettings);

			window.renderer = renderer;

			renderer.addEventListener("ready", () => {
				console.log("Beginning autoplay.");

				video.play();
			});

			renderer.resize(...this.props.currentResolution);

			onRendererCreated(renderer);
		});
	}
});

const Actions = {
	ChangeToVideoResolution: 13,
	ChangeToScriptResolution: 14,
	EnableDisableSubs: 15,
	VideoMetadataLoaded: 16,
	ScriptLoaded: 17,
	RendererCreated: 18,
};

export function reducer(
	state = {
		videoResolution: null,
		assResolution: null,

		subsEnabled: true,

		currentResolution: null,

		renderer: null,
	},
	action
) {
	switch (action.type) {
		case Actions.ChangeToVideoResolution:
			return {
				...state,
				currentResolution: [...state.videoResolution],
			};

		case Actions.ChangeToScriptResolution:
			return {
				...state,
				currentResolution: [...state.assResolution],
			};

		case Actions.EnableDisableSubs:
			const { subsEnabled } = action.payload;
			return {
				...state,
				subsEnabled
			};

		case Actions.VideoMetadataLoaded:
			const { videoResolution } = action.payload;
			return {
				...state,
				videoResolution,
				currentResolution: [...videoResolution],
			};

		case Actions.ScriptLoaded:
			const { assResolution } = action.payload;
			return {
				...state,
				assResolution,
			};

		case Actions.RendererCreated:
			const { renderer } = action.payload;
			return {
				...state,
				renderer,
			};

		default:
			return state;
	}
}

function metadataLoaded(video) {
	return new Promise((resolve, reject) => {
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
}
