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

// Needed to set correct xmlns on <svg> and to preserve attributes on feFunc*.
// Required for 0.14.x. May become unnecessary with 15.x

import SVGDOMPropertyConfig from "react/lib/SVGDOMPropertyConfig";

import DOMProperty from "react/lib/DOMProperty";
const MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;

SVGDOMPropertyConfig.Properties.in = MUST_USE_ATTRIBUTE;
SVGDOMPropertyConfig.Properties.intercept = MUST_USE_ATTRIBUTE;
SVGDOMPropertyConfig.Properties.slope = MUST_USE_ATTRIBUTE;
SVGDOMPropertyConfig.Properties.xmlns = MUST_USE_ATTRIBUTE;
