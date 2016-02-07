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

/**
 * Creates a video of the given color, dimensions and duration, and prepares the given video element to play it.
 */
export function makeDummyVideo(video, width, height, color, duration) {
	return new libjass.Promise((resolve, reject) => {
		video.width = width;
		video.height = height;

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		context.fillStyle = color;
		context.fillRect(0, 0, width, height);

		const stream = canvas.captureStream(0);
		const recorder = new MediaRecorder(stream);

		recorder.start(1); // Get as many events as possible to have a chance at getting the smallest possible chunk.

		let blob = null;

		recorder.addEventListener("dataavailable", event => {
			if (recorder.state === "inactive") {
				// Being called after recorder.stop(). Do nothing.
				return;
			}

			if (event.data.size === 0) {
				console.warn("No new data.");
				return;
			}

			recorder.pause(); // Don't get flooded with new blobs while parsing the current blob.

			if (blob === null) {
				blob = event.data;
				if (!MediaSource.isTypeSupported(blob.type)) {
					/* MediaRecorder may record a format that MediaSource doesn't support. As of Nightly 46, this is true, since MediaRecorder
					 * records webm which MediaSource doesn't play unless media.mediasource.webm.enabled is true in about:config
					 */

					recorder.stop();
					reject(new Error(`MediaRecorder is recording video in ${ blob.type } but MediaSource doesn't support it. Make sure media.mediasource.webm.enabled is on in about:config`));
					return;
				}
			}
			else {
				blob = new Blob([blob, event.data], { type: blob.type });
			}

			// Data is available but may not contain any frames. Test for that.
			libjass.Promise.all([newMediaSourceAndBuffer(video, blob.type), blobToArrayBuffer(blob)]).then(([[mediaSource, sourceBuffer], buffer]) =>
				appendBuffer(sourceBuffer, buffer).then(() => {
					console.log(`Got enough data for ${ getEndTime(sourceBuffer) } seconds.`);

					return [mediaSource, sourceBuffer, buffer];
				})
			).then(result => {
				resolve(result);

				recorder.stop();
			}, reason => {
				console.warn(reason);
				console.warn("Waiting for more data...");

				recorder.resume();
			});
		});
	}).then(([mediaSource, sourceBuffer, buffer]) =>
		appendBufferUntil(sourceBuffer, buffer, duration).then(() => mediaSource.endOfStream()));
}

/**
 * Sets up the given `video` to use a new MediaSource, and appends a new SourceBuffer of the given `type`.
 */
function newMediaSourceAndBuffer(video, type) {
	return new libjass.Promise((resolve, reject) => {
		const mediaSource = new MediaSource();

		function onSourceOpen() {
			mediaSource.removeEventListener("sourceopen", onSourceOpen, false);

			try {
				const sourceBuffer = mediaSource.addSourceBuffer(type);

				resolve([mediaSource, sourceBuffer]);
			}
			catch (ex) {
				reject(ex);
			}
		}

		mediaSource.addEventListener("sourceopen", onSourceOpen, false);

		video.src = URL.createObjectURL(mediaSource);
	});
}

/**
 * Converts a Blob to an ArrayBuffer
 */
function blobToArrayBuffer(blob) {
	return new libjass.Promise((resolve, reject) => {
		const fileReader = new FileReader();

		fileReader.addEventListener("load", () => {
			resolve(fileReader.result);
		}, false);
		fileReader.addEventListener("error", reject);

		fileReader.readAsArrayBuffer(blob);
	});
}

/**
 * Appends the given video data `buffer` to the given `sourceBuffer`.
 */
function appendBuffer(sourceBuffer, buffer) {
	return new libjass.Promise((resolve, reject) => {
		const currentEndTime = getEndTime(sourceBuffer);

		function onUpdateEnd() {
			sourceBuffer.removeEventListener("updateend", onUpdateEnd, false);

			if (sourceBuffer.buffered.length === 0) {
				reject(new Error(`buffer of length ${ buffer.byteLength } could not be appended to sourceBuffer. It's probably too small and doesn't contain any frames.`));
				return;
			}

			const newEndTime = getEndTime(sourceBuffer);
			if (newEndTime === currentEndTime) {
				reject(new Error("sourceBuffer is not increasing in size. Perhaps buffer is too small?"));
				return;
			}

			resolve();
		}

		sourceBuffer.addEventListener("updateend", onUpdateEnd, false);

		sourceBuffer.timestampOffset = currentEndTime;
		sourceBuffer.appendBuffer(buffer);
	});
}

/**
 * Repeatedly appends the given video data `buffer` to the given `sourceBuffer` until it is of `duration` length.
 */
function appendBufferUntil(sourceBuffer, buffer, duration) {
	const currentEndTime = getEndTime(sourceBuffer);
	if (currentEndTime < duration) {
		return appendBuffer(sourceBuffer, buffer).then(() => appendBufferUntil(sourceBuffer, buffer, duration));
	}
	else {
		return libjass.Promise.resolve();
	}
}

/**
 * Gets the end time of a SourceBuffer.
 */
function getEndTime(sourceBuffer) {
	return (sourceBuffer.buffered.length === 0) ? 0 : sourceBuffer.buffered.end(0);
}
