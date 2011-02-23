package pl.org.nowoczesnapolska;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.Toast;

public class Shelves extends Activity {
	Context ctx;
	static final String[] SHELVES = new String[] { 
		"Moje lektury szkolne",
		"Do przeczytania",
		"Ulubione",
		"Do pracy",
		"Na konkurs",
	};		
	
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.catalogue_shelves);
        ctx = this;
        
        final ListView lv = (ListView) findViewById(R.id.catalogueShelvesListView);
        Button putOnShelf = (Button) findViewById(R.id.putOnShelf);
        Button addShelf = (Button) findViewById(R.id.addShelf);
        
        // shelves list
        lv.setAdapter(new ArrayAdapter<String>(this, R.layout.catalogue_shelves_list_item, SHELVES));        
        lv.setOnItemClickListener(new OnItemClickListener() {
        	@Override
        	public void onItemClick(AdapterView<?> parent, View view,
              int position, long id) {
        		startActivity(new Intent(ctx, ShelvesItem.class));
        	}
        });
        
        // put on shelf handler
        putOnShelf.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// dialog with shelves list
				AlertDialog.Builder builder = new AlertDialog.Builder(ctx);
				builder.setTitle("Choose shelf");
				builder.setItems(SHELVES, new DialogInterface.OnClickListener() {
				    public void onClick(DialogInterface dialog, int item) {
				        Toast.makeText(getApplicationContext(), "Book added to shelf: "+SHELVES[item], Toast.LENGTH_SHORT).show();
				    }
				});
				AlertDialog alert = builder.create();
				alert.show();
			}
		});
        
        // add shelf handler
        addShelf.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				final EditText input = new EditText(ctx);   				
				String message = "Please type shelf name.";
				new AlertDialog.Builder(ctx)
					.setTitle("Adding shelf").setMessage(message).setView(
						input)
					.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
							public void onClick(DialogInterface dialog, int whichButton) {
								Editable value = input.getText();
								Toast.makeText(getApplicationContext(), "Shelf "+value+" successfully created", Toast.LENGTH_SHORT).show();
							}
					})
					.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int whichButton) {
							// Do nothing.
						}
					})
					.show();				
			}
		});
                
    }
}
