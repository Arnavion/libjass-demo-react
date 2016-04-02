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

import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";

import "./index.css";
import "libjass.css";

import { App, reducer } from "./app.jsx";

addEventListener("DOMContentLoaded", () => render(<Provider store={ createStore(reducer) }><App /></Provider>, document.querySelector("#root")));
