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

const mimeType = "video/webm";

export function isDummyVideoSupported() {
	return (
		typeof HTMLCanvasElement.prototype.captureStream === "function" &&
		typeof MediaRecorder !== "undefined" &&
		MediaRecorder.isTypeSupported(mimeType) &&
		typeof MediaSource !== "undefined" &&
		typeof MediaSource.isTypeSupported === "function" &&
		MediaSource.isTypeSupported(mimeType)
	);
};

/**
 * Creates a video of the given color, dimensions and duration, and prepares the given video element to play it.
 */
export function makeDummyVideo(video, width, height, color, duration) {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		context.fillStyle = color;
		context.fillRect(0, 0, width, height);

		const stream = canvas.captureStream(0);
		const recorder = new MediaRecorder(stream, { mimeType });

		recorder.start(1); // Get as many events as possible to have a chance at getting the smallest possible chunk.

		requestAnimationFrame(function drawCanvas() {
			if (recorder.state === "inactive") {
				return;
			}

			requestAnimationFrame(drawCanvas);

			context.fillRect(0, 0, 0, 0);
			stream.requestFrame();
		});

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
			}
			else {
				blob = new Blob([blob, event.data], { type: mimeType });
			}

			// Data is available but may not contain any frames. Test for that.
			Promise.all([newMediaSourceAndBuffer(video), blobToArrayBuffer(blob)]).then(([[mediaSource, sourceBuffer], buffer]) =>
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
		}, false);
	}).then(([mediaSource, sourceBuffer, buffer]) =>
		appendBufferUntil(sourceBuffer, buffer, duration).then(() => mediaSource.endOfStream()));
}

/**
 * Sets up the given `video` to use a new MediaSource, and appends a new SourceBuffer.
 */
function newMediaSourceAndBuffer(video) {
	return new Promise((resolve, reject) => {
		const mediaSource = new MediaSource();

		mediaSource.addEventListener("sourceopen", function onSourceOpen() {
			mediaSource.removeEventListener("sourceopen", onSourceOpen, false);

			try {
				const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

				resolve([mediaSource, sourceBuffer]);
			}
			catch (ex) {
				reject(ex);
			}
		}, false);

		video.src = URL.createObjectURL(mediaSource);
	});
}

/**
 * Converts a Blob to an ArrayBuffer
 */
function blobToArrayBuffer(blob) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();

		fileReader.addEventListener("load", () => {
			resolve(fileReader.result);
		}, false);
		fileReader.addEventListener("error", reject, false);

		fileReader.readAsArrayBuffer(blob);
	});
}

/**
 * Appends the given video data `buffer` to the given `sourceBuffer`.
 */
function appendBuffer(sourceBuffer, buffer) {
	return new Promise((resolve, reject) => {
		const currentEndTime = getEndTime(sourceBuffer);

		sourceBuffer.addEventListener("updateend", function onUpdateEnd() {
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
		}, false);

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
		return Promise.resolve();
	}
}

/**
 * Gets the end time of a SourceBuffer.
 */
function getEndTime(sourceBuffer) {
	return (sourceBuffer.buffered.length === 0) ? 0 : sourceBuffer.buffered.end(0);
}
