/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { join } from "path"
import { spawn } from "../support/support-util"

module.exports = (gulp) => {
  gulp.task("build-container", () => spawn(
    "docker",
    ["build", "-t", "gardenengine/garden-sync:latest", join(__dirname)],
  ))
}

if (process.cwd() === __dirname) {
  module.exports(require("gulp"))
}
