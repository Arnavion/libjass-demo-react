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
import { createReducer, makeUniqueActions } from "./redux-helpers";

class _Video extends Component {
	render() {
		const {
			videoResolution, assResolution,
			subsEnabled,
			currentResolution,
			renderer,

			onChangeToVideoResolution,
			onChangeToScriptResolution,
			onEnableDisableSubs,

			videoChoice,
			videoFile,
			videoUrl,
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
						src={
							(() => {
								switch (videoChoice) {
									case VideoChoice.LocalFile:
										return videoFile;

									case VideoChoice.Url:
										return videoUrl;
								}
							})()
						}
					>{
						(videoChoice === VideoChoice.Sample) ? [
								<source key={ 0 } type="video/webm" src="sample.webm" />,
								<source key={ 1 } type="video/mp4" src="sample.mp4" />
							] :
							[]
					}</video>
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

		const videoPromise = (() => {
			switch (videoChoice) {
				case VideoChoice.LocalFile:
				case VideoChoice.Url:
				case VideoChoice.Sample:
					return metadataLoaded(video);

				case VideoChoice.Dummy:
					const [dummyVideoWidth, dummyVideoHeight] = videoDummyResolution;
					return makeDummyVideo(video, dummyVideoWidth, dummyVideoHeight, videoDummyColor, videoDummyDuration);
			}
		})().then(() => {
				console.log("Video metadata loaded.");

				onVideoMetadataLoaded([video.videoWidth, video.videoHeight]);
			}).catch(reason => {
				const errorCode = (reason.code !== undefined) ? [null, "MEDIA_ERR_ABORTED", "MEDIA_ERR_NETWORK", "MEDIA_ERR_DECODE", "MEDIA_ERR_SRC_NOT_SUPPORTED"][reason.code] : "";
				console.error("Video could not be loaded: %o %o", errorCode, reason);

				throw reason;
			});

		const assPromise = (() => {
			switch (assChoice) {
				case AssChoice.LocalFile:
					return libjass.ASS.fromUrl(assFile);

				case AssChoice.Url:
					return libjass.ASS.fromUrl(assUrl);

				case AssChoice.Text:
					return libjass.ASS.fromString(assText);
			}
		})().then(ass => {
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

			onRendererCreated(renderer);
		});
	}
}

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

const Actions = makeUniqueActions({
	onChangeToVideoResolution: () => undefined,

	onChangeToScriptResolution: () => undefined,

	onEnableDisableSubs: subsEnabled => ({ subsEnabled }),

	onVideoMetadataLoaded: videoResolution => ({ videoResolution }),

	onScriptLoaded: assResolution => ({ assResolution }),

	onRendererCreated: renderer => ({ renderer }),
});

export const Video = connect(mapStateToProps, Actions)(props => <_Video { ...props } />);

export const reducer = createReducer({
	videoResolution: null,
	assResolution: null,

	subsEnabled: true,

	currentResolution: null,

	renderer: null,
}, {
	[Actions.onChangeToVideoResolution.type]: state => ({ ...state, currentResolution: [...state.videoResolution] }),

	[Actions.onChangeToScriptResolution.type]: state => ({ ...state, currentResolution: [...state.assResolution] }),

	[Actions.onEnableDisableSubs.type]: (state, { subsEnabled }) => ({ ...state, subsEnabled }),

	[Actions.onVideoMetadataLoaded.type]: (state, { videoResolution }) => ({
		...state,
		videoResolution,
		currentResolution: [...videoResolution],
	}),

	[Actions.onScriptLoaded.type]: (state, { assResolution }) => ({ ...state, assResolution }),

	[Actions.onRendererCreated.type]: (state, { renderer }) => ({ ...state, renderer }),
});

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
