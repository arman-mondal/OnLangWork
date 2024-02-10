import React from "react";

export default function Swatch({ setToolType, rubWhiteboard, changeTextClor, changeTextSize, newLine }) {
  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <div>
            <button className="mx-1 px-2"
              title="Pencil"
              onClick={() => {
                setToolType("pencil");
              }}
            >
              <i class="fa fa-pencil" aria-hidden="true"></i>
            </button>
            <button className="mx-1 px-2"
              title="Line"
              onClick={() => {
                setToolType("line");
              }}
            >
              <i class="fas fa-arrows-alt-h"></i>
            </button>

            <button className="mx-1 px-2"
              title="Line"
              onClick={() => {
                rubWhiteboard();
              }}
            >
              <i class="fa fa-eraser"></i>
            </button>

            <button className="mx-1 px-2"
              title="Line"
              onClick={() => {
                newLine();
              }}
            >
              <i class="fas fa-level-down-alt"></i>
            </button>

            <input type="color" className="mx-1 px-2"
              title="Line"
              onChange={(e) => {
                changeTextClor(e.currentTarget.value);
              }}
            />

            <select onChange={(e) => {
              changeTextSize(e.currentTarget.value)
            }}>
              {/* <option value="9px">9px</option>
              <option value="10px">10px</option>
              <option value="11px">11px</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option> */}
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="22px">22px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
              <option value="36px">36px</option>
              <option value="42px">42px</option>
              <option value="48px">48px</option>
            </select>
            
          </div>
        </div>
      </div>
    </div>
  );
}