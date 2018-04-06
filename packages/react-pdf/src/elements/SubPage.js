import warning from 'fbjs/lib/warning';
import Base from './Base';

class SubPage extends Base {
  get size() {
    return this.parent.getSize();
  }

  get style() {
    return this.parent.style;
  }

  set style(style) {
    return style;
  }

  resetMargins() {
    if (
      !!this.style.marginTop ||
      !!this.style.marginBottom ||
      !!this.style.marginLeft ||
      !!this.style.marginRight
    ) {
      warning(
        false,
        'Margin values are not allowed on Page element. Use padding instead.',
      );

      this.style.marginTop = 0;
      this.style.marginBottom = 0;
      this.style.marginLeft = 0;
      this.style.marginRight = 0;
    }
  }

  applyProps() {
    super.applyProps();
    this.resetMargins();

    if (this.props.size) {
      const size = this.size;

      if (this.props.orientation === 'landscape') {
        this.layout.setWidth(size[1]);
        this.layout.setHeight(size[0]);
      } else {
        this.layout.setHeight(size[1]);
        this.layout.setWidth(size[0]);
      }
    }
  }

  getPage() {
    return this.parent;
  }

  splice(height) {
    this.layout.calculateLayout();

    const toErase = [];
    const result = this.clone();
    const padding = this.padding;

    this.children.forEach(child => {
      // If element outside height
      if (height < child.top) {
        result.appendChild(child.clone());
        toErase.push(child);
      } else if (height < child.top + child.height) {
        const spliced = child.splice(height - child.top - padding.bottom);

        if (spliced) {
          result.appendChild(spliced);
        }
      }
    });

    toErase.forEach(child => this.removeChild(child));

    result.applyProps();
    result.height = this.height - height;
    result.style.height = result.height;

    return result;
  }

  async render(page) {
    const { orientation } = this.props;

    // Since Text needs it's parent layout,
    // we need to calculate flexbox layout for a first time.

    // Ask each children to recalculate it's layout.
    // This puts all Text nodes in a dirty state
    // await this.recalculateLayout();

    // Finally, calculate flexbox's layout
    // one more time based new widths and heights.
    // this.layout.calculateLayout();

    this.root.addPage({ size: this.size, layout: orientation, margin: 0 });

    if (this.style.backgroundColor) {
      this.root
        .fillColor(this.style.backgroundColor)
        .rect(0, 0, this.root.page.width, this.root.page.height)
        .fill();
    }

    await this.renderChildren(page);
  }
}

export default SubPage;
