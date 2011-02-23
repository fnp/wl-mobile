package pl.org.nowoczesnapolska;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;

public class ShelvesItem extends Activity {
	Context ctx;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.catalogue_shelves_item);
        ctx = this;
    }
}
