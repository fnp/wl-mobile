package pl.org.nowoczesnapolska;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ListView;

public class CatalogueItem extends Activity {
	static final String[] BOOKS = new String[] { 
		"*** (Dobry wieczór, nazywam siê Mickiewicz...)",
		"Akslop",
		"Ho³d (Dwa sonety)",
		"Order",
		"Pan Tadeusz, czyli ostatni zajazd na Litwie",
		"Po ciemku",
		"W ciemnoœci schodzi moja dusza"
	};	
	static final private int MENU_SHARE = Menu.FIRST;
	static final private int MENU_SIGNIN = Menu.FIRST+1;
	static final private int MENU_SETTINGS = Menu.FIRST+2;	
	static final private int MENU_ABOUT = Menu.FIRST+3;
	
	Context ctx;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.catalogue_item_details);
        ctx = this;

        final ListView lv = (ListView) findViewById(R.id.catalogueBookListView);
        
        lv.setAdapter(new ArrayAdapter<String>(this, R.layout.catalogue_book_list_item, BOOKS));        
        lv.setOnItemClickListener(new OnItemClickListener() {
        	@Override
        	public void onItemClick(AdapterView<?> parent, View view,
              int position, long id) {
        		//String selectedItemText = ((TextView) view).getText().toString();
				//search.setText(selectedItemText);
        		//lv.setFilterText(selectedItemText);
        		startActivity(new Intent(ctx, CatalogueBook.class));
        	}
        });        
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
    	super.onCreateOptionsMenu(menu);

    	int groupId;
    	int menuItemId;
    	int menuItemOrder;
    	int menuItemText;

    	// share
    	groupId = 1;
    	menuItemId = MENU_SHARE;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_share;    	
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);
    	
    	
    	// sign in
    	groupId = 0;
    	menuItemId = MENU_SIGNIN;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_signin;    	
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);
    	
    	// settings
    	groupId = 0;
    	menuItemId = MENU_SETTINGS;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_settings;    	
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);    	
    	
    	// about
    	groupId = 0;
    	menuItemId = MENU_ABOUT;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_about;
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);
    	    	
    	
    	
    	return true;
    }    

    public boolean onOptionsItemSelected(MenuItem item) {
    	
    	super.onOptionsItemSelected(item);
    	switch (item.getItemId()) {
    		case (MENU_SHARE):
				Intent shareIntent = new Intent(android.content.Intent.ACTION_SEND);
				shareIntent.setType("text/plain");
				shareIntent.putExtra(android.content.Intent.EXTRA_SUBJECT, "Wolne Lektury: Autor");
				shareIntent.putExtra(android.content.Intent.EXTRA_TEXT, "Miron Miron");				
				startActivity(Intent.createChooser(shareIntent, "Share this author"));	
    			return true;
    		case (MENU_SIGNIN):
    			startActivity(new Intent(ctx, SignIn.class));
    			return true;
    		case (MENU_SETTINGS):
    			startActivity(new Intent(ctx, Settings.class));
    			return true;
    		case (MENU_ABOUT):
    			startActivity(new Intent(ctx, About.class));
    			return true;    		
    	}    			

    	return false;    	
    }    

}
